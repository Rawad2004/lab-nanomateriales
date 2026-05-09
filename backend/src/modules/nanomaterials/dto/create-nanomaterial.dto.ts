import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, MaxLength } from 'class-validator';

export class CreateNanomaterialDto {
  @ApiProperty({
    description: 'Nombre del nanomaterial.',
    example: 'Nanopartículas de plata',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description:
      'Descripción detallada del nanomaterial: composición, método de síntesis u otra información relevante.',
    example:
      'Nanopartículas con propiedades antimicrobianas obtenidas mediante reducción química de nitrato de plata.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description:
      'Propiedades físico-químicas del nanomaterial. Objeto JSON con keys arbitrarias (size, color, shape, etc.).',
    example: {
      size: '20nm',
      color: 'gris',
      shape: 'esférica',
      synthesisMethod: 'Turkevich',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  properties!: Record<string, unknown>;

  @ApiProperty({
    description:
      'Aplicaciones del nanomaterial. Texto libre que describe usos potenciales o reales.',
    example:
      'Recubrimientos antimicrobianos, sensores biológicos, terapias dirigidas.',
  })
  @IsString()
  @IsNotEmpty()
  aplications!: string;
}
