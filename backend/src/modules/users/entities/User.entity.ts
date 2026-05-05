import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Role } from '../enums/Role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ select: false, nullable: false })
  password!: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    const isHash =
      this.password.startsWith('2b$') && this.password.length === 60;

    if (!isHash) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @Column({ nullable: false })
  name!: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Role,
    default: Role.USER,
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
}
