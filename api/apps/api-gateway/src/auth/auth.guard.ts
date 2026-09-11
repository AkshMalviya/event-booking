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
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { UserEntity } from '@app/contracts/auth/user.entity';

type AuthenticatedRequest = Request & {
  user?: UserEntity;
};

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
    await this.authClient.connect();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Authentication cookie is required');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      request.user = await firstValueFrom(
        this.authClient.send<UserEntity>(AUTH_PATTERNS.GET_USER, {
          userId: payload.sub,
        }),
      );

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication cookie');
    }
  }
}
