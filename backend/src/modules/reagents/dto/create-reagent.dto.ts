import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Unit } from '../enums/Unit.enum';

export class CreateReagentDto {
  @ApiProperty({
    description: 'Nombre del reactivo químico.',
    example: 'Ácido sulfúrico',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Fórmula química del reactivo. Campo opcional.',
    example: 'H2SO4',
    required: false,
  })
  @IsString()
  @IsOptional()
  formula?: string;

  @ApiProperty({
    description:
      'Cantidad disponible en inventario, expresada en la unidad indicada. Debe ser un entero mayor o igual a 0.',
    example: 500,
    minimum: 0,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stock!: number;

  @ApiProperty({
    description: 'Unidad de medida del stock.',
    example: Unit.MILILITERS,
    enum: Unit,
    enumName: 'Unit',
  })
  @IsEnum(Unit)
  @IsNotEmpty()
  unit!: Unit;

  @ApiProperty({
    description:
      'Fecha de vencimiento del reactivo. Debe enviarse en formato ISO 8601 (YYYY-MM-DD).',
    example: '2026-12-31',
    format: 'date',
  })
  @IsNotEmpty()
  @IsDateString()
  expirationDate!: string;

  @ApiProperty({
    description:
      'Notas u observaciones sobre el almacenamiento o uso del reactivo. Campo opcional.',
    example: 'Almacenar en lugar fresco y seco, lejos de la luz directa.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  observations: string | null = null;
}
