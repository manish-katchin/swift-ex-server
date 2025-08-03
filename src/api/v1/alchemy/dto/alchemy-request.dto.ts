import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AlchemyMethod } from 'src/common/enum/alchemy.enum';

export class AlchemyRequestDto {
  @IsNotEmpty()
  body: any;

  @IsNotEmpty()
  @IsEnum(() => AlchemyMethod)
  method: AlchemyMethod;

  @IsString()
  url: string;

  @IsNotEmpty()
  headers: Record<string, string>;
}
