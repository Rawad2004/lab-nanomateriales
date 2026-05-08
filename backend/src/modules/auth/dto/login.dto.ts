import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario registrado en el sistema.',
    example: 'admin@nanolab.com',
    format: 'email',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario.',
    example: 'Admin1234',
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  password!: string;
}
