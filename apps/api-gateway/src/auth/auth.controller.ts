import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';

import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @Public()
  register(@Body() data: { name: string; email: string; password: string }) {
    return firstValueFrom(this.authClient.send('auth.register', data));
  }

  @Post('login')
  @Public()
  async login(
    @Body() data: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(
      this.authClient.send('auth.login', data),
    );

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
    });

    return { user: result.user };
  }

  @Post('logout')
  @Public()
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  me(@Req() request: Request & { user: unknown }) {
    return request.user;
  }
}
