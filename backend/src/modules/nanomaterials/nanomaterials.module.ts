import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nanomaterial } from './entity/Nanomaterial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nanomaterial])],
})
export class NanomaterialsModule {}
