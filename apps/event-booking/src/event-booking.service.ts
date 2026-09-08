import { Injectable } from '@nestjs/common';

@Injectable()
export class EventBookingService {
  getHello(): string {
    return 'Hello World!';
  }
}
