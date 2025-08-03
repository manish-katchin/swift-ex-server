import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AuthOtpRepository } from './auth-otp.repository';
import { SendOtpDto } from './dto/send-otp.dto';
import { User } from '../users/schema/user.schema';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthOtp } from './schema/auth-otp.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly authOtpRepository: AuthOtpRepository,
  ) {}
  async sendOtp(sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    let fullName: string;
    const user: User | null = await this.userService.findOne({ email });
    if (user) {
      fullName = `${user.firstName} ${user.lastName}`;
    } else {
      fullName = email;
    }
    const otp = this.generateOtp();
    await this.authOtpRepository.create(sendOtpDto, otp);
    this.mailService.sendMail(
      email,
      'One-Time Passcode Verification',
      'send-otp',
      { fullName, otp },
    );
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;
    const authOtp: AuthOtp | null = await this.authOtpRepository.findOne({
      email,
    });
    if (!authOtp) {
      Logger.log('==== Otp not found ===');
      throw new BadRequestException('Invalid otp');
    }
    if (authOtp.otp !== otp) {
      Logger.log('==== Otp did not match ===');
      throw new BadRequestException('Invalid otp');
    }
    let user: User | null = await this.userService.findOne({ email });
    if (!user) {
      user = await this.userService.createUser({ email });
    }
    const token = this.jwtService.sign(
      JSON.stringify({ _id: user?._id, email }),
    );
    return {
      token,
      user,
    };
  }

  private generateOtp(): number {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000);
  }
}
