import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { Order } from '../orders/entity/Order.entity';
import { Reagent } from '../reagents/entities/Reagent.entity';
import { Equipment } from '../equipment/entity/Equipment.entity';
import { Nanomaterial } from '../nanomaterials/entity/Nanomaterial.entity';
import { User } from '../users/entities/User.entity';

import { OrderState } from '../orders/enums/OrderState.enum';
import { StateEquipment } from '../equipment/enums/StateEquipment.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Reagent)
    private readonly reagentRepository: Repository<Reagent>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Nanomaterial)
    private readonly nanomaterialRepository: Repository<Nanomaterial>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Retorna un snapshot del estado actual del laboratorio para mostrar
   * en la pantalla de inicio del frontend.
   */
  async getSummary() {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    // ============ Conteos rápidos ============
    const [
      totalReagents,
      totalEquipment,
      totalNanomaterials,
      totalActiveUsers,
    ] = await Promise.all([
      this.reagentRepository.count(),
      this.equipmentRepository.count(),
      this.nanomaterialRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isActive: true } }),
    ]);

    // ============ Órdenes por estado ============
    const ordersByStateRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.state', 'state')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.state')
      .getRawMany<{ state: OrderState; count: string }>();

    const ordersByState: Record<OrderState, number> = {
      [OrderState.DRAFT]: 0,
      [OrderState.APPROVED]: 0,
      [OrderState.IN_PROGRESS]: 0,
      [OrderState.COMPLETED]: 0,
      [OrderState.CANCELLED]: 0,
    };
    for (const row of ordersByStateRaw) {
      ordersByState[row.state] = Number(row.count);
    }

    // ============ Equipos por estado ============
    const equipmentByStateRaw = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .select('equipment.state', 'state')
      .addSelect('COUNT(equipment.id)', 'count')
      .groupBy('equipment.state')
      .getRawMany<{ state: StateEquipment; count: string }>();

    const equipmentByState: Record<StateEquipment, number> = {
      [StateEquipment.AVAILABLE]: 0,
      [StateEquipment.IN_USE]: 0,
      [StateEquipment.MAINTENANCE]: 0,
    };
    for (const row of equipmentByStateRaw) {
      equipmentByState[row.state] = Number(row.count);
    }

    // ============ Reactivos vencidos ============
    const expiredReagents = await this.reagentRepository.find({
      where: { expirationDate: LessThan(today) },
      select: { id: true, name: true, expirationDate: true, stock: true, unit: true },
    });

    // ============ Reactivos por vencer (próximos 30 días) ============
    const expiringSoonReagents = await this.reagentRepository
      .createQueryBuilder('reagent')
      .where('reagent.expirationDate >= :today', { today })
      .andWhere('reagent.expirationDate <= :limit', { limit: in30Days })
      .select([
        'reagent.id',
        'reagent.name',
        'reagent.expirationDate',
        'reagent.stock',
        'reagent.unit',
      ])
      .getMany();

    // ============ Reactivos con stock bajo (< 10 unidades) ============
    const lowStockReagents = await this.reagentRepository
      .createQueryBuilder('reagent')
      .where('reagent.stock < :threshold', { threshold: 10 })
      .select([
        'reagent.id',
        'reagent.name',
        'reagent.stock',
        'reagent.unit',
      ])
      .getMany();

    // ============ Equipos en mantenimiento o próximos a mantenimiento ============
    const equipmentInMaintenance = await this.equipmentRepository.find({
      where: { state: StateEquipment.MAINTENANCE },
      select: { id: true, name: true, type: true, nextMaintenance: true },
    });

    // ============ Últimas 5 órdenes ============
    const recentOrders = await this.orderRepository.find({
      relations: { nanomaterial: true, createdBy: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      counts: {
        reagents: totalReagents,
        equipment: totalEquipment,
        nanomaterials: totalNanomaterials,
        activeUsers: totalActiveUsers,
      },
      ordersByState,
      equipmentByState,
      alerts: {
        expiredReagents,
        expiringSoonReagents,
        lowStockReagents,
        equipmentInMaintenance,
      },
      recentOrders,
    };
  }
}
