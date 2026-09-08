import { ConflictException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userModel.findOne({
      email: data.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

      const user = await this.userModel.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
      });

      return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({
      email: email.toLowerCase(),
    });
  }

  async findById(userId: string) {
    return this.userModel.findById(userId);
  }
}
