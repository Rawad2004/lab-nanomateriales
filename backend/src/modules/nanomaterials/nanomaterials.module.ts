import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nanomaterial } from './entity/Nanomaterial.entity';
import { NanomaterialsService } from './nanomaterials.service';

@Module({
  imports: [TypeOrmModule.forFeature([Nanomaterial])],
  providers: [NanomaterialsService],
  exports: [NanomaterialsService],
})
export class NanomaterialsModule {}
