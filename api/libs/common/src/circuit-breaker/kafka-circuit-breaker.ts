import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import CircuitBreaker from 'opossum';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class KafkaCircuitBreaker {
  private readonly logger = new Logger(KafkaCircuitBreaker.name);
  private breakers = new Map<string, CircuitBreaker>();

  constructor(private readonly kafkaClient: ClientKafka) {}

  private getBreaker(topic: string): CircuitBreaker {
    if (!this.breakers.has(topic)) {
      const options = {
        timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
        errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
        resetTimeout: 30000, // After 30 seconds, try again
        volumeThreshold: 5,
      };

      const action = async (pattern: any, data: any) => {
        return lastValueFrom(this.kafkaClient.send(pattern, data));
      };

      const breaker = new CircuitBreaker(action, options);

      breaker.fallback((pattern: any, data: any, error: Error) => {
        this.logger.error(
          `[FALLBACK] Circuit breaker fallback triggered for topic: ${topic}. Reason: ${error.message}`,
        );
        const exception = new ServiceUnavailableException(
          `Service unavailable for topic: ${topic}`,
        );
        // Ensure status code is present for standard error handlers just in case instanceof fails
        (exception as any).statusCode = 503;
        (exception as any).status = 503;
        throw exception;
      });

      // State change logs
      breaker.on('open', () =>
        this.logger.warn(
          `🔴 Circuit breaker OPENED for ${topic}. Service is failing, requests will be blocked.`,
        ),
      );
      breaker.on('halfOpen', () =>
        this.logger.log(
          `🟡 Circuit breaker HALF-OPEN for ${topic}. Testing if service is back online.`,
        ),
      );
      breaker.on('close', () =>
        this.logger.log(
          `🟢 Circuit breaker CLOSED for ${topic}. Service is stable.`,
        ),
      );

      // Individual request logs
      breaker.on('failure', (err) =>
        this.logger.error(
          `❌ Request FAILED for ${topic}. Error: ${err.message}`,
        ),
      );
      breaker.on('success', () =>
        this.logger.log(`✅ Request SUCCESS for ${topic}`),
      );

      this.breakers.set(topic, breaker);
    }

    return this.breakers.get(topic);
  }

  async send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Promise<TResult> {
    const topic =
      typeof pattern === 'string' ? pattern : JSON.stringify(pattern);
    const breaker = this.getBreaker(topic);
    return breaker.fire(pattern, data);
  }

  emit<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return this.kafkaClient.emit(pattern, data);
  }
}
