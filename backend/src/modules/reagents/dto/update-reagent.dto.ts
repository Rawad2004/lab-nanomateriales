import { PartialType } from '@nestjs/swagger';
import { CreateReagentDto } from './create-reagent.dto';

export class UpdateReagentDto extends PartialType(CreateReagentDto) {}
