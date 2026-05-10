import { IsInt, IsNumber, Min } from 'class-validator';

export class OrderReagentDto {
  @IsInt()
  @Min(1)
  reagentId!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity!: number;
}
