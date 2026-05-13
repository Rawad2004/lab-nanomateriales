import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/Order.entity';
import { OrderEquipment } from './entity/OrderEquipment.entity';
import { OrderReagent } from './entity/OrderReagent.entity';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderEquipment, OrderReagent])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
