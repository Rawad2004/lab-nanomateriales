import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/Order.entity';
import { OrderEquipment } from './entity/OrderEquipment.entity';
import { OrderReagent } from './entity/OrderReagent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderEquipment, OrderReagent])],
})
export class OrdersModule {}
