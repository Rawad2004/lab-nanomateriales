import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nanomaterial } from './entity/Nanomaterial.entity';
import { NanomaterialsService } from './service/nanomaterials.service';
import { NanomaterialsController } from './nanomaterials.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nanomaterial])],
  controllers: [NanomaterialsController],
  providers: [NanomaterialsService],
  exports: [NanomaterialsService],
})
export class NanomaterialsModule {}
