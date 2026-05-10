import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/Role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario.',
    example: 'Juan Pérez',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Email del usuario. Debe ser único en el sistema.',
    example: 'juan.perez@nanolab.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description:
      'Contraseña del usuario. Mínimo 8 caracteres, máximo 72 (límite de bcrypt).',
    example: 'MiPassword123',
    format: 'password',
    minLength: 8,
    maxLength: 72,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({
    description:
      'Rol del usuario en el sistema. Determina qué acciones puede ejecutar.',
    example: Role.SCIENTIST,
    enum: Role,
    enumName: 'Role',
  })
  @IsEnum(Role)
  role!: Role;
}
