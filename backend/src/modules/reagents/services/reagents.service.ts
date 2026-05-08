import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reagent } from '../entities/Reagent.entity';
import { CreateReagent } from '../dto/create-reagent.dto';
import { UpdateReagent } from '../dto/update-reagent.dto';

@Injectable()
export class ReagentsService {
  constructor(
    @InjectRepository(Reagent)
    private readonly reagentRepository: Repository<Reagent>,
  ) {}

  async findOne(id: number): Promise<Reagent> {
    const reagent = await this.reagentRepository.findOneBy({ id });

    if (!reagent) {
      throw new NotFoundException(`Reagent con ${id} no encontrado`);
    }

    return reagent;
  }

  async create(dto: CreateReagent): Promise<Reagent> {
    const reagent = this.reagentRepository.create(dto);

    return await this.reagentRepository.save(reagent);
  }

  async remove(id: number) {
    const result = await this.reagentRepository.delete(id);
    return result;
  }

  async update(id: number, dto: UpdateReagent): Promise<Reagent> {
    const reagent = await this.reagentRepository.preload({ id, ...dto });

    if (!reagent) {
      throw new NotFoundException(`Reagent con ${id} no encontrado`);
    }

    return this.reagentRepository.save(reagent);
  }

  async findAll() {
    return await this.reagentRepository.find();
  }

  async decrementStock(id: number, amount: number): Promise<void> {
    const result = await this.reagentRepository.decrement(
      { id },
      'stock',
      amount,
    );

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    return;
  }
}
