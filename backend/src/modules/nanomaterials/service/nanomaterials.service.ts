import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Nanomaterial } from '../entity/Nanomaterial.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNanomaterialDto } from '../dto/create-nanomaterial.dto';
import { UpdateNanomaterialDto } from '../dto/update-nanomaterial.dto';

@Injectable()
export class NanomaterialsService {
  constructor(
    @InjectRepository(Nanomaterial)
    private readonly nanomaterialRepository: Repository<Nanomaterial>,
  ) {}

  async create(dto: CreateNanomaterialDto): Promise<Nanomaterial> {
    const nanomaterial = this.nanomaterialRepository.create(dto);

    return await this.nanomaterialRepository.save(nanomaterial);
  }

  async findOne(id: number): Promise<Nanomaterial> {
    const nanomaterial = await this.nanomaterialRepository.findOneBy({ id });

    if (!nanomaterial) {
      throw new NotFoundException(
        `El nanomaterial con el id ${id} no fue encontrado`,
      );
    }

    return nanomaterial;
  }

  async findAll() {
    return await this.nanomaterialRepository.find();
  }

  async update(id: number, dto: UpdateNanomaterialDto): Promise<Nanomaterial> {
    const nanomaterial = await this.nanomaterialRepository.preload({
      id,
      ...dto,
    });

    if (!nanomaterial) {
      throw new NotFoundException(
        `El nanomaterial con el id ${id} no fue encontrado`,
      );
    }

    return this.nanomaterialRepository.save(nanomaterial);
  }

  async remove(id: number): Promise<void> {
    const result = await this.nanomaterialRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `El nanomaterial con el id ${id} no fue encontrado`,
      );
    }
  }

  async toggleActive(id: number): Promise<Nanomaterial> {
    const nanomaterial = await this.findOne(id);
    nanomaterial.isActive = !nanomaterial.isActive;
    return this.nanomaterialRepository.save(nanomaterial);
  }
}
