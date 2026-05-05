import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Reagent } from './entities/Reagent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reagent])],
})
export class ReagentsModule {}
