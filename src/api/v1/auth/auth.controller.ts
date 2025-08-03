import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('api/v1/auth/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Res() response, @Body() sendOtpDto: SendOtpDto) {
    await this.authService.sendOtp(sendOtpDto);
    response.status(201).json({ success: true });
  }

  @Post('verify-otp')
  async verifyOtp(@Res() response, @Body() verifyOtpDto: VerifyOtpDto) {
    const { user, token } = await this.authService.verifyOtp(verifyOtpDto);
    response.status(201).json({ user, token });
  }
}
