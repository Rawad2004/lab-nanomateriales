import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entity/Order.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order-dto';
import { User } from 'src/modules/users/entities/User.entity';
import { Nanomaterial } from 'src/modules/nanomaterials/entity/Nanomaterial.entity';
import { Equipment } from 'src/modules/equipment/entity/Equipment.entity';
import { StateEquipment } from 'src/modules/equipment/enums/StateEquipment.enum';
import { Reagent } from 'src/modules/reagents/entities/Reagent.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto, currentUser: User): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const nanomaterial = await manager.findOne(Nanomaterial, {
        where: { id: dto.nanomaterialId },
      });

      if (!nanomaterial) {
        throw new NotFoundException(
          `Nanomaterial con id ${dto.nanomaterialId} no encontrado`,
        );
      }

      if (!nanomaterial.isActive) {
        throw new BadRequestException(
          `El nanomaterial "${nanomaterial.name}" está inactivo y no puede usarse en nuevas órdenes`,
        );
      }

      const equipmentsId = dto.equipments.map((e) => e.equipmentId);
      const equipments = await manager.find(Equipment, {
        where: { id: In(equipmentsId) },
      });

      if (equipments.length !== equipmentsId.length) {
        const found = equipments.map((e) => e.id);
        const missing = equipmentsId.filter((id) => !found.includes(id));

        throw new NotFoundException(
          `Equipos no encontrados: ${missing.join(', ')}`,
        );
      }

      const unavailable = equipments.filter(
        (e) => e.state !== StateEquipment.AVAILABLE,
      );

      if (unavailable.length > 0) {
        throw new BadRequestException(
          `Equipos no disponibles: ${unavailable.map((e) => `"${e.name}" (${e.state})`).join(', ')}`,
        );
      }

      const reagentsId = dto.reagents.map((r) => r.reagentId);
      const reagents = await manager.find(Reagent, {
        where: { id: In(reagentsId) },
      });

      if (reagents.length !== reagentsId.length) {
        const found = reagents.map((r) => r.id);
        const missing = reagentsId.filter((id) => !found.includes(id));

        throw new NotFoundException(
          `Reactivos no encontrados: ${missing.join(', ')}`,
        );
      }

      const reagentsById = new Map(reagents.map((r) => [r.id, r]));

      const today = new Date();

      for (const item of dto.reagents) {
        const reagent = reagentsById.get(item.reagentId)!;

        if (new Date(reagent.expirationDate) < today) {
          throw new BadRequestException(
            `El reactivo "${reagent.name}" está vencido (vence ${new Date(reagent.expirationDate).toISOString().split('T')[0]})`,
          );
        }

        if (Number(reagent.stock) < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${reagent.name}": ` +
              `solicitado ${item.quantity} ${reagent.unit}, disponible ${reagent.stock} ${reagent.unit}`,
          );
        }
      }

      const order = manager.create(Order, {
        nanomaterial,
        createdBy: currentUser,
        observations: dto.observations ?? null,
        reagents: dto.reagents.map((item) => ({
          reagent: reagentsById.get(item.reagentId),
          quantity: item.quantity,
        })),
        equipments: dto.equipments.map((item) => ({
          equipment: equipments.find((e) => e.id === item.equipmentId),
        })),
      });

      return await manager.save(Order, order);
    });
  }
}
