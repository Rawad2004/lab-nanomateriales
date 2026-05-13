import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({
    summary: 'Snapshot del estado del laboratorio',
    description:
      'Retorna un objeto con conteos, alertas y datos recientes para la pantalla de inicio del frontend. ' +
      'Incluye: totales por tipo de entidad, órdenes por estado, equipos por estado, ' +
      'reactivos vencidos, próximos a vencer (30 días), con stock bajo (< 10 unidades), ' +
      'equipos en mantenimiento, y las últimas 5 órdenes creadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot del laboratorio.',
    schema: {
      example: {
        counts: {
          reagents: 12,
          equipment: 8,
          nanomaterials: 5,
          activeUsers: 3,
        },
        ordersByState: {
          DRAFT: 2,
          APPROVED: 1,
          IN_PROGRESS: 1,
          COMPLETED: 3,
          CANCELLED: 0,
        },
        equipmentByState: {
          AVAILABLE: 5,
          IN_USE: 2,
          MAINTENANCE: 1,
        },
        alerts: {
          expiredReagents: [],
          expiringSoonReagents: [
            {
              id: 3,
              name: 'Etanol 96%',
              expirationDate: '2026-05-30',
              stock: 500,
              unit: 'ml',
            },
          ],
          lowStockReagents: [],
          equipmentInMaintenance: [
            {
              id: 4,
              name: 'Espectrofotómetro UV',
              type: 'Espectroscopía',
              nextMaintenance: '2026-06-01',
            },
          ],
        },
        recentOrders: [
          {
            id: 7,
            state: 'IN_PROGRESS',
            createdAt: '2026-05-09T16:00:00.000Z',
            nanomaterial: { id: 1, name: 'Nanopartículas de plata' },
            createdBy: { id: 2, name: 'María López' },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @Get()
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
