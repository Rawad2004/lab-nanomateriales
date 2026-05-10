import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto = CreateUserDto sin password, con todos los campos opcionales.
 *
 * Por qué la password se EXCLUYE: el cambio de password es una acción
 * sensible que merece su propio endpoint (/users/me/password o similar)
 * con validación adicional (current password, doble confirm, etc.).
 *
 * Si alguien envía `password` en un PUT, el ValidationPipe global lo
 * rechaza con 400 gracias a `forbidNonWhitelisted: true`.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
