import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './Order.entity';
import { Reagent } from 'src/modules/reagents/entities/Reagent.entity';

@Entity()
export class OrderReagent {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Order, { nullable: false })
  order!: Order;

  @ManyToOne(() => Reagent, { nullable: false })
  reagent!: Reagent;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;
}
