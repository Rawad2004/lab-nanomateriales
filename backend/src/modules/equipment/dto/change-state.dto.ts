import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StateEquipment } from '../enums/StateEquipment.enum';

export class ChangeStateDto {
  @ApiProperty({
    description:
      'Nuevo estado al que se cambiará el equipo. Debe ser uno de los valores válidos del enum StateEquipment.',
    example: StateEquipment.MAINTENANCE,
    enum: StateEquipment,
    enumName: 'StateEquipment',
  })
  @IsEnum(StateEquipment)
  state!: StateEquipment;
}
