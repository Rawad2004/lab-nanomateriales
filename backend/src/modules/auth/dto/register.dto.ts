import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @ApiProperty()
  name!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MinLength(8)
  @ApiProperty()
  password!: string;
}
