import { Nanomaterial } from 'src/modules/nanomaterials/entity/Nanomaterial.entity';
import { User } from 'src/modules/users/entities/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderState } from '../enums/OrderState.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => Nanomaterial, {
    nullable: false,
  })
  nanomaterial!: Nanomaterial;

  @ManyToOne(() => User, {
    nullable: false,
  })
  createdBy!: User;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.DRAFT,
    nullable: false,
  })
  state!: OrderState;

  @Column({ type: 'text', nullable: true })
  observations: string | null = null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'date', nullable: true })
  approvalDate: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date | null = null;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User | null = null;
}
