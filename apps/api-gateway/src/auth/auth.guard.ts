import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from './public.decorator';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

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
        this.authClient.send('auth.get-user', { userId: payload.sub }),
      );

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication cookie');
    }
  }
}
