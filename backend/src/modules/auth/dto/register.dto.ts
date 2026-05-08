import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario.',
    example: 'Juan Pérez',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    description: 'Email del usuario. Debe ser único en el sistema.',
    example: 'juan.perez@nanolab.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Mínimo 8 caracteres.',
    example: 'MiPassword123',
    format: 'password',
    minLength: 8,
  })
  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MinLength(8)
  password!: string;
}
