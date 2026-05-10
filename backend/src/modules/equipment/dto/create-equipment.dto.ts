import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StateEquipment } from '../enums/StateEquipment.enum';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'Nombre del equipo de laboratorio.',
    example: 'Microscopio electrónico de barrido',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Tipo o categoría del equipo.',
    example: 'Microscopía',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;

  @ApiProperty({
    description:
      'Estado operativo del equipo. Si no se envía, se crea como AVAILABLE por default.',
    example: StateEquipment.AVAILABLE,
    enum: StateEquipment,
    enumName: 'StateEquipment',
    required: false,
  })
  @IsEnum(StateEquipment)
  @IsOptional()
  state?: StateEquipment;

  @ApiProperty({
    description:
      'Fecha del próximo mantenimiento programado, en formato ISO 8601 (YYYY-MM-DD). Campo opcional.',
    example: '2026-12-15',
    format: 'date',
    required: false,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  nextMaintenance?: string | null;

  @ApiProperty({
    description:
      'Notas u observaciones sobre el equipo (ubicación, peculiaridades, mantenimiento histórico, etc.). Campo opcional.',
    example:
      'Mantenimiento preventivo cada 6 meses. Ubicado en laboratorio 3B.',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  observations?: string | null;
}
