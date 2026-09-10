import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';
import { Public } from './public.decorator';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { SignupDto } from '@app/contracts/auth/signup.dto';
import { LoginDto } from '@app/contracts/auth/login.dto';
import { UserEntity } from '@app/contracts/auth/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @Public()
  register(@Body() data: SignupDto) {
    return firstValueFrom(
      this.authClient.send<UserEntity>(AUTH_PATTERNS.REGISTER, data),
    );
  }

  @Post('login')
  @Public()
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(
      this.authClient.send<{ accessToken: string; user: UserEntity }>(
        AUTH_PATTERNS.LOGIN,
        data,
      ),
    );

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
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
  me(@Req() request: Request & { user: UserEntity }) {
    return request.user;
  }
}
