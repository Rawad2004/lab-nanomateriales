import { OrderReagentDto } from './order-reagent-dto';
import { OrderEquipmentDto } from './order-equipment-dto';
import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  nanomaterialId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderReagentDto)
  reagents!: OrderReagentDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderEquipmentDto)
  equipment!: OrderEquipmentDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations!: string;
}
