import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Booking, BookingDocument, BookingStatus } from './schema/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @Inject('EVENT_SERVICE')
    private readonly eventClient: ClientProxy,
  ) {}

  async create(data: CreateBookingDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const { eventId, ticketsCount } = data;

    const event = await firstValueFrom(
      this.eventClient.send('events.find-one', { eventId }),
    );

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Check if the event date is already in the past
    if (new Date(event.startDate) <= new Date()) {
      throw new BadRequestException(
        'Cannot book tickets for past or ongoing events',
      );
    }

    // 3. Atomically reserve seats
    const reservedEvent = await firstValueFrom(
      this.eventClient.send('events.reserve-seats', {
        eventId,
        count: ticketsCount,
      }),
    );

    if (!reservedEvent) {
      throw new BadRequestException('Not enough seats available');
    }

    // 4. Create booking
    const totalPrice = event.price * ticketsCount;
    return this.bookingModel.create({
      userId,
      eventId,
      ticketsCount,
      totalPrice,
      status: BookingStatus.CONFIRMED,
    });
  }

  async findUserBookings(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    return this.bookingModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(bookingId: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new UnauthorizedException('Access denied to this booking');
    }

    return booking;
  }

  async cancel(bookingId: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to cancel this booking',
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    // Release seats in event service
    await firstValueFrom(
      this.eventClient.send('events.release-seats', {
        eventId: booking.eventId,
        count: booking.ticketsCount,
      }),
    );

    return booking;
  }
}
