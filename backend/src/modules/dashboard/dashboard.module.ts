import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { Order } from '../orders/entity/Order.entity';
import { Reagent } from '../reagents/entities/Reagent.entity';
import { Equipment } from '../equipment/entity/Equipment.entity';
import { Nanomaterial } from '../nanomaterials/entity/Nanomaterial.entity';
import { User } from '../users/entities/User.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Reagent, Equipment, Nanomaterial, User]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
