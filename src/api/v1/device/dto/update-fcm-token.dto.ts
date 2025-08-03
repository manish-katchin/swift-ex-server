import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFcmTokenDto {
  @IsNotEmpty()
  fcmToken: string;
}
