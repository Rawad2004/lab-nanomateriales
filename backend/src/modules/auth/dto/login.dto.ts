import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsString()
  @ApiProperty()
  @Transform(({ value }: { value: string }) => value.trim())
  password!: string;
}
