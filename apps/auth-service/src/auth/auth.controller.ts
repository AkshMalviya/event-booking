import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  register(@Payload() data: { name: string; email: string; password: string }) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.get-user')
  getUser(@Payload() data: { userId: string }) {
    return this.authService.getUser(data.userId);
  }
}
