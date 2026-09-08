import { Test, TestingModule } from '@nestjs/testing';
import { EventBookingController } from './event-booking.controller.js';
import { EventBookingService } from './event-booking.service.js';

describe('EventBookingController', () => {
  let eventBookingController: EventBookingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventBookingController],
      providers: [EventBookingService],
    }).compile();

    eventBookingController = app.get<EventBookingController>(EventBookingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eventBookingController.getHello()).toBe('Hello World!');
    });
  });
});
