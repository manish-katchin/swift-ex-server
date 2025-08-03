import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(
    signupDto: any,
    session?: mongoose.ClientSession,
  ): Promise<User> {
    const createdUser = new this.userModel(signupDto);
    if (session) {
      return createdUser.save({ session });
    }
    return createdUser.save();
  }

  async findOne(cond: Record<string, any>): Promise<User | null> {
    return await this.userModel.findOne(cond);
  }

  findOneWithPassword(cond: Record<string, any>): Promise<User | null> {
    return this.userModel.findOne(cond).select('+password');
  }

  update(
    _id: mongoose.Schema.Types.ObjectId,
    object: UpdateUserDto,
    session?: mongoose.ClientSession,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate({ _id }, object, { session });
  }
}
