import { PartialType } from '@nestjs/swagger';
import { CreateReagent } from './create-reagent.dto';

export class UpdateReagent extends PartialType(CreateReagent) {}
