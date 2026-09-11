import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  isValidObjectId,
  Model,
  PipelineStage,
  QueryFilter,
  Types,
} from 'mongoose';
import { CreateEventDto } from '@app/contracts/events/create-event.dto';
import { UpdateEventDto } from '@app/contracts/events/update-event.dto';
import { Event, EventDocument } from './schema/event.schema';
import { PaginationService } from '@app/common/services/pagination.service';
import {
  EventQueryDto,
  SortOrder,
} from '@app/contracts/events/event-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly paginationService: PaginationService,
  ) {}

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') || 'event';

    let slug = baseSlug;
    let count = 1;

    while (await this.eventModel.exists({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  async create(data: CreateEventDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate <= new Date()) {
      throw new BadRequestException('Event start date must be in the future');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const slug = await this.generateUniqueSlug(data.title);

    return this.eventModel.create({
      title: data.title,
      description: data.description,
      availableSeats: data.availableSeats,
      price: data.price,
      image: data.image,
      tags: data.tags ?? [],
      userId,
      slug,
      startDate,
      endDate,
      registeredCount: 0,
    });
  }

  async update(eventId: string, userId: string, data: UpdateEventDto) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.userId.toString() !== userId) {
      throw new UnauthorizedException('You can only edit your own events');
    }

    if (new Date(event.startDate) <= new Date()) {
      throw new BadRequestException('Cannot edit ongoing or past events');
    }

    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (startDate <= new Date()) {
        throw new BadRequestException('Event start date must be in the future');
      }
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= startDate) {
          throw new BadRequestException('End date must be after start date');
        }
      } else if (new Date(event.endDate) <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    } else if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (endDate <= new Date(event.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (data.availableSeats !== undefined) {
      if (data.availableSeats < event.registeredCount) {
        throw new BadRequestException(
          `Cannot reduce seats below already registered count (${event.registeredCount})`,
        );
      }
    }

    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.startDate !== undefined)
      event.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) event.endDate = new Date(data.endDate);
    if (data.availableSeats !== undefined)
      event.availableSeats = data.availableSeats;
    if (data.tags !== undefined) event.tags = data.tags;
    if (data.image !== undefined) event.image = data.image;

    return event.save();
  }

  findAll(query: EventQueryDto = {}) {
    const { page, limit, search, isFree, sortBy, sortOrder, timeline } = query;

    const matchStage: QueryFilter<Event> = {};

    if (timeline) {
      const now = new Date();
      if (timeline === 'upcoming') {
        matchStage.startDate = { $gt: now };
      } else if (timeline === 'past') {
        matchStage.endDate = { $lt: now };
      } else if (timeline === 'ongoing') {
        matchStage.startDate = { $lte: now };
        matchStage.endDate = { $gte: now };
      }
    }

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (isFree !== undefined) {
      if (isFree) {
        matchStage.price = 0;
      } else {
        matchStage.price = { $gt: 0 };
      }
    }

    const aggregation: PipelineStage[] = [];
    if (Object.keys(matchStage).length > 0) {
      aggregation.push({ $match: matchStage });
    }

    let sortField = sortBy || 'startDate';
    const order = sortOrder === SortOrder.DESC ? -1 : 1;
    aggregation.push({ $sort: { [sortField]: order } });

    return this.paginationService.aggregate(
      this.eventModel,
      aggregation,
      [],
      page,
      limit,
    );
  }

  async findOne(identifier: string) {
    let event = await this.eventModel.findOne({ slug: identifier }).exec();
    if (!event && isValidObjectId(identifier)) {
      event = await this.eventModel.findById(identifier).exec();
    }
    return event;
  }

  async reserveSeats(eventId: string, count: number) {
    if (!count || count < 1) {
      return null;
    }

    const filter: QueryFilter<Event> = {
      $expr: {
        $lte: [{ $add: ['$registeredCount', count] }, '$availableSeats'],
      },
    };

    if (isValidObjectId(eventId)) {
      filter._id = eventId;
    } else {
      filter.slug = eventId;
    }

    return this.eventModel
      .findOneAndUpdate(
        filter,
        { $inc: { registeredCount: count } },
        { new: true },
      )
      .exec();
  }

  async releaseSeats(eventId: string, count: number) {
    if (!count || count < 1) {
      return null;
    }

    const filter: QueryFilter<Event> = {};
    if (isValidObjectId(eventId)) {
      filter._id = eventId;
    } else {
      filter.slug = eventId;
    }

    return this.eventModel
      .findOneAndUpdate(
        filter,
        { $inc: { registeredCount: -count } },
        { new: true },
      )
      .exec();
  }

  async filterByTimeline(eventIds: string[], timeline: string) {
    const now = new Date();
    const matchStage: QueryFilter<Event> = { _id: { $in: eventIds } };

    if (timeline === 'upcoming') {
      matchStage.startDate = { $gt: now };
    } else if (timeline === 'past') {
      matchStage.endDate = { $lt: now };
    } else if (timeline === 'ongoing') {
      matchStage.startDate = { $lte: now };
      matchStage.endDate = { $gte: now };
    }

    const events = await this.eventModel
      .find(matchStage)
      .select('_id')
      .lean()
      .exec();
    return events.map((e) => e._id.toString());
  }

  findOrganizerEvents(userId: string, query: EventQueryDto = {}) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }
    const { page, limit } = query;
    const aggregation: PipelineStage[] = [
      { $match: { userId: new Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
    ];
    return this.paginationService.aggregate(
      this.eventModel,
      aggregation,
      [],
      page,
      limit,
    );
  }
}
