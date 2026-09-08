import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateEventDto } from './dto/create-event.dto';
import { Event, EventDocument } from './schema/event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(data: CreateEventDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user is required');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.eventModel.create({
      ...data,
      userId,
      startDate,
      endDate,
      tags: data.tags ?? [],
      registeredCount: 0,
    });
  }

  findAll() {
    return this.eventModel.find().sort({ startDate: 1 }).exec();
  }

  findOne(eventId: string) {
    return this.eventModel.findById(eventId).exec();
  }
}
