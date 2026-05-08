import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reagent } from './entities/Reagent.entity';
import { ReagentsController } from './reagents.controller';
import { ReagentsService } from './services/reagents.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reagent])],
  controllers: [ReagentsController],
  providers: [ReagentsService],
})
export class ReagentsModule {}
