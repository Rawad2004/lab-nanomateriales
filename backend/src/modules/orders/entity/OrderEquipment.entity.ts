import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './Order.entity';
import { Equipment } from 'src/modules/equipment/entity/Equipment.entity';

@Entity()
export class OrderEquipment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Order, (order) => order.equipments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  order!: Order;

  @ManyToOne(() => Equipment, { nullable: false })
  equipment!: Equipment;
}
