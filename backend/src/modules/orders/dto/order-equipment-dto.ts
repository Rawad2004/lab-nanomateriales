import { IsInt, Min } from 'class-validator';

export class OrderEquipmentDto {
  @IsInt()
  @Min(1)
  equipmentId!: number;
}
