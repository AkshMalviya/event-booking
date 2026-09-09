import {
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '@app/contracts/auth/signup.dto';
import { LoginDto } from '@app/contracts/auth/login.dto';
import { UserEntity } from '@app/contracts/auth/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: SignupDto): Promise<UserEntity> {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.createUser({
      ...data,
      password: hashedPassword,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(data.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getUser(userId: string): Promise<UserEntity> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  }
}
