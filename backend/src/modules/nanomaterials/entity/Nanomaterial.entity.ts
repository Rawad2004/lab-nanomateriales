import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Nanomaterial {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: false })
  name!: string;

  @Column('text', { nullable: false })
  description!: string;

  @Column('json', { nullable: false })
  properties!: any;

  @Column('text', { nullable: false })
  aplications!: string;

  @Column('boolean', { nullable: false, default: true })
  isActive!: boolean;
}
