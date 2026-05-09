import { PartialType } from '@nestjs/swagger';
import { CreateNanomaterialDto } from './create-nanomaterial.dto';

export class UpdateNanomaterialDto extends PartialType(CreateNanomaterialDto) {}
