import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Unit } from '../enums/Unit.enum';

@Entity()
export class Reagent {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  formula!: string;

  @Column({ nullable: false })
  stock!: number;

  @Column({ nullable: false, type: 'enum', enum: Unit })
  unit!: Unit;

  @Column({ nullable: false })
  expirationDate!: Date;

  @CreateDateColumn()
  entryDate!: Date;

  @Column({ type: 'text', nullable: true })
  observations: string | null = null;
}
