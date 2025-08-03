import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './schema/user.schema';
import { CreateUserDto } from '../../../common/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User | null> {
    return this.userRepo.create(createUserDto);
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const { phoneNumber } = updateUserDto;
    if (phoneNumber) {
      let userByPhone: User | null = await this.userRepo.findOne({
        phoneNumber,
      });
      if (userByPhone && userByPhone?._id !== user._id) {
        throw new BadRequestException(
          `User already exist with phone number ${phoneNumber}`,
        );
      }
    }
    return this.userRepo.update(
      user._id,
      Object.assign(user, { ...updateUserDto }),
    );
  }

  findOne(cond: any): Promise<User | null> {
    return this.userRepo.findOne(cond);
  }
}
