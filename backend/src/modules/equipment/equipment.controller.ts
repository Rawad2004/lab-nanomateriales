import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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

import { EquipmentService } from './service/equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ChangeStateDto } from './dto/change-state.dto';
import { StateEquipment } from './enums/StateEquipment.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/Role.enum';

@ApiTags('equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @ApiOperation({
    summary: 'Listar todos los equipos',
    description:
      'Retorna la lista completa de equipos del laboratorio con su estado operativo y fecha de próximo mantenimiento. Cualquier usuario autenticado puede consultar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de equipos.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Microscopio electrónico de barrido',
          type: 'Microscopía',
          state: 'AVAILABLE',
          nextMaintenance: '2026-12-15',
          observations: 'Mantenimiento preventivo cada 6 meses.',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener un equipo por ID',
    description: 'Retorna los detalles de un equipo específico.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del equipo a consultar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Equipo encontrado.',
    schema: {
      example: {
        id: 1,
        name: 'Microscopio electrónico de barrido',
        type: 'Microscopía',
        state: 'AVAILABLE',
        nextMaintenance: '2026-12-15',
        observations: 'Mantenimiento preventivo cada 6 meses.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un equipo con ese ID.',
    schema: {
      example: {
        message: 'El equipamiento con el id 99 no fue encontrado',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Registrar un nuevo equipo',
    description:
      'Registra un equipo nuevo en el laboratorio. Si no se envía el campo state, se crea como AVAILABLE por default. Solo ADMIN u OPERATOR pueden crear.',
  })
  @ApiBody({
    type: CreateEquipmentDto,
    examples: {
      microscopio: {
        summary: 'Microscopio electrónico (con todos los campos)',
        value: {
          name: 'Microscopio electrónico de barrido',
          type: 'Microscopía',
          state: StateEquipment.AVAILABLE,
          nextMaintenance: '2026-12-15',
          observations: 'Mantenimiento preventivo cada 6 meses.',
        },
      },
      minimo: {
        summary: 'Equipo mínimo (state se aplica el default)',
        value: {
          name: 'Centrífuga de mesa',
          type: 'Centrifugación',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Equipo creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN ni OPERATOR.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @ApiOperation({
    summary: 'Actualizar un equipo',
    description:
      'Modifica uno o varios campos de un equipo existente. Todos los campos del body son opcionales. Para cambiar solo el estado, considera usar PATCH /:id/state.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del equipo a actualizar.',
    example: 1,
  })
  @ApiBody({
    type: UpdateEquipmentDto,
    examples: {
      cambioFecha: {
        summary: 'Solo actualizar fecha de mantenimiento',
        value: { nextMaintenance: '2027-03-30' },
      },
      cambioObservaciones: {
        summary: 'Actualizar observaciones',
        value: {
          observations: 'Reubicado al laboratorio 4A. Calibrado el 2026-05-10.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Equipo actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN ni OPERATOR.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un equipo con ese ID.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Eliminar un equipo',
    description:
      'Elimina permanentemente un equipo del laboratorio. ADMIN u OPERATOR pueden eliminar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del equipo a eliminar.',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Equipo eliminado correctamente. Sin contenido.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN ni OPERATOR.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un equipo con ese ID.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.remove(id);
  }

  @ApiOperation({
    summary: 'Cambiar el estado de un equipo',
    description:
      'Endpoint dedicado para cambiar exclusivamente el estado de un equipo (AVAILABLE / IN_USE / MAINTENANCE) sin tocar otros campos. ADMIN u OPERATOR pueden ejecutar esta acción.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del equipo cuyo estado se va a cambiar.',
    example: 1,
  })
  @ApiBody({
    type: ChangeStateDto,
    examples: {
      mantenimiento: {
        summary: 'Pasar a mantenimiento',
        value: { state: StateEquipment.MAINTENANCE },
      },
      enUso: {
        summary: 'Marcar como en uso',
        value: { state: StateEquipment.IN_USE },
      },
      disponible: {
        summary: 'Liberar (volver a disponible)',
        value: { state: StateEquipment.AVAILABLE },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del equipo cambiado correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Microscopio electrónico de barrido',
        type: 'Microscopía',
        state: 'MAINTENANCE',
        nextMaintenance: '2026-12-15',
        observations: 'Mantenimiento preventivo cada 6 meses.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado inválido. Debe ser uno de: AVAILABLE, IN_USE, MAINTENANCE.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN ni OPERATOR.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un equipo con ese ID.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Patch(':id/state')
  changeState(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStateDto,
  ) {
    return this.equipmentService.changeState(id, dto.state);
  }
}
