import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { KafkaCircuitBreaker } from '@app/common';

type AuthenticatedRequest = Request & {
  user?: UserEntity;
};

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private breaker: KafkaCircuitBreaker;

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.authClient);
  }

  async onModuleInit() {
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
    try {
      await this.authClient.connect();
    } catch (err) {
      console.warn('Kafka connection delayed:', (err as Error).message);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    let request: AuthenticatedRequest;

    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    } else if ((context.getType() as string) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      throw new UnauthorizedException('Unsupported context type');
    }

    if (!request) {
      throw new UnauthorizedException('Could not extract request');
    }

    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Authentication cookie is required');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      request.user = await this.breaker.send<UserEntity>(
        AUTH_PATTERNS.GET_USER,
        {
          userId: payload.sub,
        },
      );

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication cookie');
    }
  }
}
