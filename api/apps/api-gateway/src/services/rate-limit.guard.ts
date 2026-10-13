import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RateLimiter } from './rateLimiter';
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiters = new Map<string, RateLimiter>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true; // No rate limit decorator on this route
    }

    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    const key = `${className}-${handlerName}`;

    let limiter = this.limiters.get(key);
    if (!limiter) {
      limiter = new RateLimiter(options);
      this.limiters.set(key, limiter);
    }

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const res = ctx.getContext().res;

    // Apply will throw HttpException if rate limit is exceeded
    limiter.apply(req, res, () => {});

    return true;
  }
}
