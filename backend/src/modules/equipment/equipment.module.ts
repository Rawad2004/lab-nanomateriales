import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entity/Equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
})
export class EquipmentModule {}
