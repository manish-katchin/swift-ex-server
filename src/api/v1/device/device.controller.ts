import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  Patch,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { DeviceService } from './device.service';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { CreateDeviceDto } from './dto/create-device.dto';

@Controller('api/v1/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Res() response, @Body() createDeviceDto: CreateDeviceDto) {
    const device = await this.deviceService.create(createDeviceDto);
    response.status(201).json({ device });
  }

  @Get(':id')
  async findOne(
    @Res() response,
    @Param('id') id: mongoose.Schema.Types.ObjectId,
  ) {
    const device = await this.deviceService.findOne(id);
    return response.status(200).json({ device });
  }

  @Get(':uniqueId/unique-id')
  async findOneByUniqueId(
    @Res() response,
    @Param('uniqueId') uniqueId: string,
  ) {
    const device = await this.deviceService.findOneByUniqueId(uniqueId);
    return response.status(200).json({ device });
  }

  @Patch(':id//update-fcm-token')
  updateFcmToken(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    return this.deviceService.updateFcmToken(id, updateFcmTokenDto);
  }

  @Patch(':id/update-user')
  updateUser(@Req() req: any, @Param('id') id: mongoose.Schema.Types.ObjectId) {
    return this.deviceService.updateUser(id, req.user);
  }
}
