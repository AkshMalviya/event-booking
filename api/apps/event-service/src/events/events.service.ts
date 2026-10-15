import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
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
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { AI_PATTERNS } from '@app/contracts/ai/at.pattern';
import { EVENT_PATTERNS } from '@app/contracts/events/event.patterns';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly paginationService: PaginationService,
    @Inject('AI_SERVICE')
    private readonly aiClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.aiClient.subscribeToResponseOf(AI_PATTERNS.SEARCH_SIMILAR_EVENTS);
    await this.aiClient.connect();
  }

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

  async create(data: CreateEventDto, userId: string, idempotencyKey?: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    if (idempotencyKey) {
      const existingEvent = await this.eventModel.findOne({
        idempotencyKey,
        userId,
      });
      if (existingEvent) {
        return existingEvent;
      }
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

    try {
      const newEvent = await this.eventModel.create({
        title: data.title,
        description: data.description,
        availableSeats: data.availableSeats,
        price: data.price,
        image: data.image as string,
        tags: data.tags ?? [],
        userId,
        slug,
        startDate,
        endDate,
        registeredCount: 0,
        idempotencyKey,
      });

      this.aiClient.emit(EVENT_PATTERNS.EVENT_CREATED, {
        id: newEvent._id.toString(),
        title: newEvent.title,
        description: newEvent.description,
        tags: newEvent.tags,
      });

      return newEvent;
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
        return this.eventModel.findOne({ idempotencyKey, userId });
      }
      throw error;
    }
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
    if (data.image !== undefined) event.image = data.image as string;

    return event.save();
  }

  async findAll(query: EventQueryDto = {}) {
    const { page, limit, search, isFree, sortBy, sortOrder, timeline } = query;

    // 1. Base filter conditions (timeline & price)
    const baseMatch: QueryFilter<Event> = {};

    if (timeline) {
      const now = new Date();
      if (timeline === 'upcoming') {
        baseMatch.startDate = { $gt: now };
      } else if (timeline === 'past') {
        baseMatch.endDate = { $lt: now };
      } else if (timeline === 'ongoing') {
        baseMatch.startDate = { $lte: now };
        baseMatch.endDate = { $gte: now };
      }
    }

    if (isFree !== undefined) {
      baseMatch.price = isFree ? 0 : { $gt: 0 };
    }

    // Helper to run query with base filters + optional search match
    const executeQuery = (searchMatch?: QueryFilter<Event>) => {
      const matchStage: QueryFilter<Event> = { ...baseMatch, ...searchMatch };
      const aggregation: PipelineStage[] = [];

      if (Object.keys(matchStage).length > 0) {
        aggregation.push({ $match: matchStage });
      }

      const sortField = sortBy || 'startDate';
      const order = sortOrder === SortOrder.DESC ? -1 : 1;
      aggregation.push({ $sort: { [sortField]: order } });

      return this.paginationService.aggregate({
        model: this.eventModel,
        aggregation,
        page,
        limit,
      });
    };

    // If no search term provided, run base query directly
    if (!search?.trim()) {
      return executeQuery();
    }

    // 2. Try AI Vector Search first
    try {
      const matchedIds: string[] = await firstValueFrom(
        this.aiClient
          .send(AI_PATTERNS.SEARCH_SIMILAR_EVENTS, {
            query: search,
            limit: Math.max(Number(limit || 10) * 5, 25),
          })
          .pipe(timeout(3000)),
      );

      const vectorObjectIds = (matchedIds || [])
        .filter((id) => isValidObjectId(id))
        .map((id) => new Types.ObjectId(id));

      if (vectorObjectIds.length > 0) {
        const vectorResult = await executeQuery({
          _id: { $in: vectorObjectIds },
        });

        // Return vector results if any events matched the base filters
        if (vectorResult.meta.total > 0) {
          return vectorResult;
        }
      }
    } catch (err) {
      console.warn(
        'Vector search failed, falling back to MongoDB regex:',
        (err as Error).message,
      );
    }

    // 3. Fallback: If vector search found nothing, search using MongoDB regex
    const regex = { $regex: search, $options: 'i' };
    return executeQuery({
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    });
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
    return this.paginationService.aggregate({
      model: this.eventModel,
      aggregation,
      page,
      limit,
    });
  }
}
