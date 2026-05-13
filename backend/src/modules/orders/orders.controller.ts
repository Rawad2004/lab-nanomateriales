import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { OrdersService } from './services/orders.service';
import { CreateOrderDto } from './dto/create-order-dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../users/enums/Role.enum';
import { User } from '../users/entities/User.entity';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Crear una orden de síntesis',
    description:
      'Crea una nueva orden. Valida que el nanomaterial esté activo, ' +
      'los equipos AVAILABLE, los reactivos no vencidos y con stock suficiente. ' +
      'Todo en una transacción atómica: si algo falla, nada se guarda. ' +
      'La orden se crea en estado DRAFT. Cualquier usuario autenticado puede crear.',
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      ordenSimple: {
        summary: 'Orden básica con un reactivo y un equipo',
        value: {
          nanomaterialId: 1,
          reagents: [{ reagentId: 1, quantity: 50 }],
          equipments: [{ equipmentId: 1 }],
          observations: 'Síntesis de prueba para experimento de antimicrobianos.',
        },
      },
      ordenCompleta: {
        summary: 'Orden con múltiples reactivos y equipos',
        value: {
          nanomaterialId: 1,
          reagents: [
            { reagentId: 1, quantity: 50 },
            { reagentId: 2, quantity: 200 },
          ],
          equipments: [{ equipmentId: 1 }, { equipmentId: 2 }],
          observations: 'Síntesis con múltiples reactivos y equipos.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Orden creada en estado DRAFT.' })
  @ApiResponse({
    status: 400,
    description:
      'Una o más reglas de negocio fallaron (nanomaterial inactivo, equipos no disponibles, reactivos vencidos, stock insuficiente).',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({
    status: 404,
    description: 'Nanomaterial, reactivo o equipo no existe.',
  })
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(dto, user);
  }

  @ApiOperation({
    summary: 'Listar todas las órdenes',
    description:
      'Retorna todas las órdenes con nanomaterial, creador y aprobador. ' +
      'Ordenadas por fecha de creación descendente.',
  })
  @ApiResponse({ status: 200, description: 'Lista de órdenes.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener una orden con detalle completo',
    description:
      'Retorna la orden con todas sus relaciones: nanomaterial, creador, aprobador, ' +
      'reactivos consumidos (con cantidad y datos del reactivo) y equipos asignados.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Orden encontrada.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({ status: 404, description: 'No existe una orden con ese ID.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Aprobar una orden (DRAFT → APPROVED)',
    description:
      'Cambia el estado de DRAFT a APPROVED. Registra el aprobador y la fecha. ' +
      'Solo ADMIN puede aprobar órdenes.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Orden aprobada.' })
  @ApiResponse({
    status: 400,
    description: 'La orden no está en estado DRAFT.',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({ status: 403, description: 'No eres ADMIN.' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada.' })
  @Roles(Role.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ordersService.approve(id, user);
  }

  @ApiOperation({
    summary: 'Iniciar una orden (APPROVED → IN_PROGRESS)',
    description:
      'Cambia el estado de APPROVED a IN_PROGRESS. Cualquier usuario autenticado puede iniciar.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Orden iniciada.' })
  @ApiResponse({
    status: 400,
    description: 'La orden no está en estado APPROVED.',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada.' })
  @Patch(':id/start')
  start(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.start(id);
  }

  @ApiOperation({
    summary: 'Completar una orden (IN_PROGRESS → COMPLETED)',
    description:
      'Marca la orden como COMPLETED y DESCUENTA el stock de los reactivos consumidos. ' +
      'Todo el descuento ocurre en una transacción atómica: si falla algo, ' +
      'el estado y el stock se mantienen consistentes (rollback total).',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Orden completada y stock descontado.',
  })
  @ApiResponse({
    status: 400,
    description:
      'La orden no está IN_PROGRESS o el stock cambió y ya no es suficiente.',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada.' })
  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.complete(id);
  }

  @ApiOperation({
    summary: 'Cancelar una orden',
    description:
      'Marca la orden como CANCELLED. Reglas:\n' +
      '- DRAFT: el creador o un ADMIN pueden cancelar.\n' +
      '- APPROVED / IN_PROGRESS: solo un ADMIN puede cancelar.\n' +
      '- COMPLETED: no se puede cancelar.\n' +
      '- CANCELLED: ya está cancelada.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Orden cancelada.' })
  @ApiResponse({
    status: 400,
    description: 'La orden ya está completada o cancelada.',
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para cancelar esta orden en su estado actual.',
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada.' })
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ordersService.cancel(id, user);
  }
}
