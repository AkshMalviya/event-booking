import { HttpException, HttpStatus } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface IProps {
  numberOfRequest: number;
  timeInterval: number;
}

interface IReqCount {
  currentCounter: number;
  lastCallAt: number;
}

class RateLimiter {
  private readonly numberOfRequest: number = 0;
  private readonly timeInterval: number = 0; // in MS
  private readonly reqCounter = new Map<string, IReqCount>();

  constructor({ numberOfRequest, timeInterval }: IProps) {
    this.numberOfRequest = numberOfRequest;
    this.timeInterval = timeInterval;
  }

  apply(req: Request, res: Response, next: NextFunction) {
    let now = Date.now();

    let currentIp = req.ip ?? '0.0.0.0';

    let counterDetail = this.reqCounter.get(currentIp) ?? {
      currentCounter: 0,
      lastCallAt: now,
    };

    let diff = now - counterDetail.lastCallAt;

    if (
      diff < this.timeInterval &&
      counterDetail.currentCounter >= this.numberOfRequest
    ) {
      console.log(`[RateLimiter] ❌ Blocked request from ${currentIp}`);
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // window expired
    if (diff >= this.timeInterval) {
      this.reqCounter.set(currentIp, {
        lastCallAt: Date.now(),
        currentCounter: 1,
      });
    } else {
      this.reqCounter.set(currentIp, {
        lastCallAt: Date.now(),
        currentCounter: counterDetail.currentCounter + 1,
      });
    }

    next();
  }
}

export { RateLimiter };
