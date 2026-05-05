import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StateEquipment } from '../enums/StateEquipment.enum';

@Entity()
export class Equipment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  type!: string;

  @Column({ nullable: false, type: 'enum', enum: StateEquipment })
  state!: StateEquipment;

  @Column({ type: 'date', nullable: true })
  nextMaintenance: Date | null = null;

  @Column({ type: 'text', nullable: true })
  observations: string | null = null;
}
