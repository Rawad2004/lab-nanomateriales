import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipment } from '../entity/Equipment.entity';
import { Repository } from 'typeorm';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { StateEquipment } from '../enums/StateEquipment.enum';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async create(dto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(dto);

    return await this.equipmentRepository.save(equipment);
  }

  async findOne(id: number): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOneBy({ id });

    if (!equipment) {
      throw new NotFoundException(
        `El equipamiento con el id ${id} no fue encontrado`,
      );
    }

    return equipment;
  }

  async findAll(): Promise<Equipment[]> {
    return this.equipmentRepository.find();
  }

  async update(id: number, dto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.equipmentRepository.preload({ id, ...dto });

    if (!equipment) {
      throw new NotFoundException(
        `El equipamiento con el id ${id} no fue encontrado`,
      );
    }

    return this.equipmentRepository.save(equipment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.equipmentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `El equipamiento con el id ${id} no fue encontrado`,
      );
    }
  }

  async changeState(id: number, state: StateEquipment): Promise<Equipment> {
    const equipment = await this.findOne(id);
    equipment.state = state;
    return this.equipmentRepository.save(equipment);
  }
}
