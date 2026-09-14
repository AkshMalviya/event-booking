import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { Public } from './public.decorator';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { SignupDto } from '@app/contracts/auth/signup.dto';
import { LoginDto } from '@app/contracts/auth/login.dto';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { KafkaCircuitBreaker } from '@app/common';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private breaker: KafkaCircuitBreaker;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.authClient);
  }

  async onModuleInit() {
    Object.values(AUTH_PATTERNS).forEach((pattern) => {
      this.authClient.subscribeToResponseOf(pattern);
    });
    await this.authClient.connect();
  }

  @Post('register')
  @Public()
  register(@Body() data: SignupDto) {
    return this.breaker.send<UserEntity>(AUTH_PATTERNS.REGISTER, data);
  }

  @Post('login')
  @Public()
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.breaker.send<{ accessToken: string; user: UserEntity }>(
      AUTH_PATTERNS.LOGIN,
      data,
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
