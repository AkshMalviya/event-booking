import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS } from '@app/contracts/auth/auth.patterns';
import { SignupDto } from '@app/contracts/auth/signup.dto';
import { LoginDto } from '@app/contracts/auth/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() data: SignupDto) {
    return this.authService.register(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern(AUTH_PATTERNS.GET_USER)
  getUser(@Payload() data: { userId: string }) {
    return this.authService.getUser(data.userId);
  }
}
