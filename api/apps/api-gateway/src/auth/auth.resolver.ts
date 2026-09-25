import { KafkaCircuitBreaker } from '@app/common';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { LoginDto } from '@app/contracts/auth/login.dto';
import { SignupDto } from '@app/contracts/auth/signup.dto';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { Inject } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ClientKafka } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { Public } from './public.decorator';

@Resolver('auth')
export class AuthResolver {
  private breaker: KafkaCircuitBreaker;

  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientKafka,
  ) {
    this.breaker = new KafkaCircuitBreaker(this.authClient);
  }

  @Mutation(() => String)
  @Public()
  register(@Args('input', { type: () => SignupDto }) data: SignupDto) {
    return this.breaker.send<UserEntity>(AUTH_PATTERNS.REGISTER, data);
  }

  @Mutation(() => UserEntity)
  @Public()
  async login(
    @Args('input', { type: () => LoginDto }) data: LoginDto,
    @Context('res') response: Response,
  ) {
    const result = await this.breaker.send<{
      accessToken: string;
      user: UserEntity;
    }>(AUTH_PATTERNS.LOGIN, data);

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { ...result.user };
  }

  @Mutation(() => String)
  @Public()
  logout(@Context('res') response: Response) {
    response.clearCookie('access_token');
    return 'Logged out successfully';
  }

  @Query(() => UserEntity)
  me(@Context('req') request: Request & { user: UserEntity }) {
    return request.user;
  }
}
