import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Booking, BookingDocument } from './schema/booking.schema';
import { BookingStatus } from '@app/contracts/bookings/booking-status.enum';
import { CreateBookingDto } from '@app/contracts/bookings/create-booking.dto';
import {
  BookingQueryDto,
  BookingTimelineFilter,
} from '@app/contracts/bookings/booking-query.dto';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { PaginationService } from '@app/common/services/pagination.service';

@Injectable()
export class BookingsService implements OnModuleInit {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientKafka,
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientKafka,
    private readonly paginationService: PaginationService,
  ) {}

  async onModuleInit() {
    Object.values(EVENT_PATTERNS).forEach((pattern) => {
      this.eventClient.subscribeToResponseOf(pattern);
    });
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
    await this.eventClient.connect();
    await this.authClient.connect();
  }

  async create(data: CreateBookingDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const { eventId, ticketsCount } = data;

    if (!ticketsCount || ticketsCount < 1 || !Number.isInteger(ticketsCount)) {
      throw new BadRequestException('Tickets count must be a positive integer');
    }

    // 1. Fetch event
    const event = await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.FIND_ONE, { eventId }),
    );

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Validation: You cannot book your own event
    if (event.userId === userId) {
      throw new BadRequestException(
        'You cannot book tickets for your own event',
      );
    }

    // 3. Validation: Can only book if event is upcoming; cannot book if started or ended
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate <= now) {
      throw new BadRequestException(
        'This event has already ended. Bookings are closed.',
      );
    }

    if (startDate <= now) {
      throw new BadRequestException(
        'This event has already started. You can only book tickets for upcoming events.',
      );
    }

    // 5. Pre-check remaining seats
    const seatsRemaining = event.availableSeats - (event.registeredCount || 0);
    if (seatsRemaining <= 0) {
      throw new BadRequestException('This event is already sold out');
    }

    if (ticketsCount > seatsRemaining) {
      throw new BadRequestException(
        `Only ${seatsRemaining} seat(s) remaining for this event`,
      );
    }

    // 6. Atomically reserve seats with concurrency safety
    const targetEventId = event._id?.toString() || event.id || eventId;
    const reservedEvent = await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.RESERVE_SEATS, {
        eventId: targetEventId,
        count: ticketsCount,
      }),
    );

    if (!reservedEvent) {
      throw new ConflictException(
        'Not enough seats available. Someone else may have just booked the remaining seats. Please try again.',
      );
    }

    // 7. Create booking
    const totalPrice = event.price * ticketsCount;
    return this.bookingModel.create({
      userId,
      eventId: targetEventId,
      ticketsCount,
      totalPrice,
      status: BookingStatus.CONFIRMED,
    });
  }

  async findUserBookings(userId: string, query: BookingQueryDto = {}) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const { page, limit, filter } = query;
    const matchStage: any = { userId: new Types.ObjectId(userId) };

    if (filter && filter !== BookingTimelineFilter.ALL) {
      const allUserBookings = await this.bookingModel
        .distinct('eventId', { userId })
        .exec();
      if (allUserBookings.length > 0) {
        const matchedEventIds = await firstValueFrom(
          this.eventClient.send(EVENT_PATTERNS.FILTER_BY_TIMELINE, {
            eventIds: allUserBookings,
            timeline: filter,
          }),
        );
        matchStage.eventId = {
          $in: matchedEventIds.map((id: string) => new Types.ObjectId(id)),
        };
      } else {
        matchStage.eventId = { $in: [] };
      }
    }

    const aggregation: PipelineStage[] = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
    ];

    const paginated = await this.paginationService.aggregate(
      this.bookingModel,
      aggregation,
      [],
      page,
      limit,
    );

    const populatedData = await Promise.all(
      paginated.data.map(async (b: any) => {
        let event = null;
        try {
          if (b.eventId) {
            event = await firstValueFrom(
              this.eventClient.send(EVENT_PATTERNS.FIND_ONE, {
                eventId: b.eventId.toString(),
              }),
            );
          }
        } catch {
          event = null;
        }

        return {
          ...b,
          id: b._id?.toString() || b.id,
          event: event || null,
        };
      }),
    );

    return {
      data: populatedData,
      meta: paginated.meta,
    };
  }

  async findOne(bookingId: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const booking = await this.bookingModel.findById(bookingId).lean().exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId.toString() !== userId) {
      throw new UnauthorizedException('Access denied to this booking');
    }

    let event = null;
    try {
      if (booking.eventId) {
        event = await firstValueFrom(
          this.eventClient.send(EVENT_PATTERNS.FIND_ONE, {
            eventId: booking.eventId.toString(),
          }),
        );
      }
    } catch {
      event = null;
    }

    return {
      ...booking,
      id: booking._id?.toString() || (booking as any).id,
      event: event || null,
    };
  }

  async cancel(bookingId: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId.toString() !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to cancel this booking',
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    const event = await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.FIND_ONE, {
        eventId: booking.eventId.toString(),
      }),
    );
    if (event && new Date(event.startDate) <= new Date()) {
      throw new BadRequestException(
        'Cannot cancel booking for past or ongoing events',
      );
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    // Release seats in event service
    await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.RELEASE_SEATS, {
        eventId: booking.eventId,
        count: booking.ticketsCount,
      }),
    );

    const bookingObj = booking.toObject();
    return {
      ...bookingObj,
      id: booking._id?.toString(),
      event: event || null,
    };
  }

  async findAllByEvent(eventId: string, userId: string) {
    if (!eventId || !userId) {
      throw new BadRequestException('Event ID and User ID are required');
    }

    const event = await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.FIND_ONE, { eventId }),
    );

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.userId !== userId) {
      throw new UnauthorizedException(
        'You can only view bookings for your own events',
      );
    }

    const bookings = await this.bookingModel
      .find({ eventId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const populatedData = await Promise.all(
      bookings.map(async (b: any) => {
        let user = null;
        try {
          user = await firstValueFrom(
            this.authClient.send(AUTH_PATTERNS.GET_USER, {
              userId: b.userId.toString(),
            }),
          );
        } catch {
          user = null;
        }

        return {
          ...b,
          id: b._id?.toString() || b.id,
          user: user || null,
        };
      }),
    );

    return populatedData;
  }
}
