import {
  ArgumentsHost,
  Catch,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { KafkaContext } from '@nestjs/microservices';
import { Kafka, Producer } from 'kafkajs';
import { MicroserviceExceptionFilter } from './microservice-exception.filter';

@Catch()
export class KafkaDLQExceptionFilter extends MicroserviceExceptionFilter {
  private readonly logger = new Logger(KafkaDLQExceptionFilter.name);
  private producer: Producer;

  constructor() {
    super();
    const kafka = new Kafka({ brokers: ['localhost:9092'] });
    this.producer = kafka.producer();
    this.producer.connect().catch(e => this.logger.error('Failed to connect DLQ producer', e));
  }

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    try {
      const ctx = host.switchToRpc().getContext<KafkaContext>();
      if (ctx && typeof ctx.getTopic === 'function') {
        const topic = ctx.getTopic();
        const message = ctx.getMessage();
        
        this.logger.error(`Message failed in topic ${topic}, sending to DLQ. Error: ${exception?.message}`);
        
        this.producer.send({
          topic: `${topic}.DLQ`,
          messages: [{
              key: Buffer.isBuffer(message.key) ? message.key : undefined,
              value: Buffer.isBuffer(message.value) ? message.value : JSON.stringify(message.value),
              headers: {
                  ...message.headers,
                  error: String(exception?.message || 'Unknown error')
              }
          }]
        }).catch(err => this.logger.error('Failed to send to DLQ', err));
      }
    } catch (err) {
      this.logger.error('Error in DLQ Filter', err);
    }
    
    return super.catch(exception, host);
  }
}
