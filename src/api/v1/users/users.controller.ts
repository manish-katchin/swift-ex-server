import { Body, Controller, Put, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Put('')
  async sendOtp(
    @Req() req: any,
    @Res() response,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(req.user, updateUserDto);
    response.status(201).json({ user });
  }
}
