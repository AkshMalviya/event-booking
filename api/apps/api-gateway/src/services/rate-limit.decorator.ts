import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

export const RATE_LIMIT_KEY = 'rate_limit_options';

export interface RateLimitOptions {
  numberOfRequest: number;
  timeInterval: number;
}

export const RateLimit = (options: RateLimitOptions) => {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, options),
    UseGuards(RateLimitGuard)
  );
};
