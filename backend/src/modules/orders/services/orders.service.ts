import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { Order } from '../entity/Order.entity';
import { CreateOrderDto } from '../dto/create-order-dto';
import { OrderState } from '../enums/OrderState.enum';

import { User } from 'src/modules/users/entities/User.entity';
import { Role } from 'src/modules/users/enums/Role.enum';

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

  // ============================================================
  // CREATE — con transacción + R1-R4
  // ============================================================
  async create(dto: CreateOrderDto, currentUser: User): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      // R1: Nanomaterial existe y está activo
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

      // R4: Equipos existen y están AVAILABLE
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
          `Equipos no disponibles: ${unavailable
            .map((e) => `"${e.name}" (${e.state})`)
            .join(', ')}`,
        );
      }

      // R2 + R3: Reactivos existen, no vencidos, con stock
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

      // Construir y guardar (cascade graba OrderReagent y OrderEquipment)
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

  // ============================================================
  // FIND ALL — con relaciones básicas
  // ============================================================
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: {
        nanomaterial: true,
        createdBy: true,
        approvedBy: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================================
  // FIND ONE — con TODAS las relaciones (orden detail)
  // ============================================================
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        nanomaterial: true,
        createdBy: true,
        approvedBy: true,
        reagents: { reagent: true },
        equipments: { equipment: true },
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden con id ${id} no encontrada`);
    }

    return order;
  }

  // ============================================================
  // APROBAR — DRAFT → APPROVED. Solo ADMIN.
  // ============================================================
  async approve(id: number, currentUser: User): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await this.findOneTransactional(id, manager);

      if (order.state !== OrderState.DRAFT) {
        throw new BadRequestException(
          `Solo se puede aprobar una orden en estado DRAFT. Estado actual: ${order.state}`,
        );
      }

      order.state = OrderState.APPROVED;
      order.approvedBy = currentUser;
      order.approvalDate = new Date();

      return await manager.save(Order, order);
    });
  }

  // ============================================================
  // INICIAR — APPROVED → IN_PROGRESS.
  // ============================================================
  async start(id: number): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await this.findOneTransactional(id, manager);

      if (order.state !== OrderState.APPROVED) {
        throw new BadRequestException(
          `Solo se puede iniciar una orden en estado APPROVED. Estado actual: ${order.state}`,
        );
      }

      order.state = OrderState.IN_PROGRESS;
      return await manager.save(Order, order);
    });
  }

  // ============================================================
  // COMPLETAR — IN_PROGRESS → COMPLETED + descuenta stock atómico.
  // ============================================================
  async complete(id: number): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        relations: {
          nanomaterial: true,
          createdBy: true,
          approvedBy: true,
          reagents: { reagent: true },
          equipments: { equipment: true },
        },
      });

      if (!order) {
        throw new NotFoundException(`Orden con id ${id} no encontrada`);
      }

      if (order.state !== OrderState.IN_PROGRESS) {
        throw new BadRequestException(
          `Solo se puede completar una orden en estado IN_PROGRESS. Estado actual: ${order.state}`,
        );
      }

      // Descontar stock de cada reactivo consumido (atómico)
      for (const item of order.reagents) {
        const currentStock = Number(item.reagent.stock);
        const consumed = Number(item.quantity);

        if (currentStock < consumed) {
          throw new BadRequestException(
            `Stock insuficiente al completar la orden para "${item.reagent.name}": ` +
              `necesario ${consumed} ${item.reagent.unit}, disponible ${currentStock} ${item.reagent.unit}`,
          );
        }

        await manager.update(Reagent, item.reagent.id, {
          stock: currentStock - consumed,
        });
      }

      order.state = OrderState.COMPLETED;
      order.completedDate = new Date();
      return await manager.save(Order, order);
    });
  }

  // ============================================================
  // CANCELAR — Reglas de quién puede según estado actual.
  // ============================================================
  async cancel(id: number, currentUser: User): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const order = await this.findOneTransactional(id, manager);

      if (order.state === OrderState.COMPLETED) {
        throw new BadRequestException(
          'No se puede cancelar una orden ya completada.',
        );
      }
      if (order.state === OrderState.CANCELLED) {
        throw new BadRequestException('Esta orden ya está cancelada.');
      }

      // Solo el creador o un ADMIN pueden cancelar borradores
      if (
        order.state === OrderState.DRAFT &&
        order.createdBy.id !== currentUser.id &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          'Solo el creador de la orden o un ADMIN pueden cancelar borradores.',
        );
      }

      // Solo ADMIN puede cancelar órdenes aprobadas o en progreso
      if (
        (order.state === OrderState.APPROVED ||
          order.state === OrderState.IN_PROGRESS) &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          `Solo un ADMIN puede cancelar órdenes en estado ${order.state}.`,
        );
      }

      order.state = OrderState.CANCELLED;
      return await manager.save(Order, order);
    });
  }

  // ============================================================
  // Helper privado: buscar orden con relaciones dentro de transacción.
  // ============================================================
  private async findOneTransactional(
    id: number,
    manager: EntityManager,
  ): Promise<Order> {
    const order = await manager.findOne(Order, {
      where: { id },
      relations: {
        nanomaterial: true,
        createdBy: true,
        approvedBy: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden con id ${id} no encontrada`);
    }

    return order;
  }
}
