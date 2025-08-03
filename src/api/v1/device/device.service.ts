import { Injectable, NotFoundException } from '@nestjs/common';
import { Device } from './schema/device.schema';
import { DeviceRepository } from './device.repository';
import mongoose from 'mongoose';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { User } from '../users/schema/user.schema';

@Injectable()
export class DeviceService {
  constructor(private readonly deviceRepo: DeviceRepository) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device | null> {
    const { uniqueId, fcmToken } = createDeviceDto;
    const device: Device | null = await this.deviceRepo.findOne({ uniqueId });
    if (device) {
      return this.deviceRepo.updateFcmToken(device._id, fcmToken);
    }
    return this.deviceRepo.create(createDeviceDto);
  }

  async updateFcmToken(
    _id: mongoose.Schema.Types.ObjectId,
    updateFcmToken: UpdateFcmTokenDto,
  ): Promise<Device | null> {
    const { fcmToken } = updateFcmToken;
    const device: Device | null = await this.deviceRepo.findOne({ _id });

    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return this.deviceRepo.updateFcmToken(device._id, fcmToken);
  }

  async updateUser(
    _id: mongoose.Schema.Types.ObjectId,
    user: User,
  ): Promise<Device | null> {
    const device: Device | null = await this.deviceRepo.findOne({ _id });

    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return this.deviceRepo.updateUser(device._id, user._id);
  }

  findOne(_id: mongoose.Schema.Types.ObjectId): Promise<Device | null> {
    return this.deviceRepo.findOne({ _id });
  }

  findOneByUniqueId(uniqueId: string): Promise<Device | null> {
    return this.deviceRepo.findOne({ uniqueId });
  }
}
