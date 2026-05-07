import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../enums/Role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Role,
    default: Role.SCIENTIST,
  })
  role!: Role;

  @Column({
    default: true,
    nullable: false,
  })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'delete_at' })
  deleteAt!: Date;
}
