import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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

import { ReagentsService } from './services/reagents.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/Role.enum';
import { CreateReagentDto } from './dto/create-reagent.dto';
import { UpdateReagentDto } from './dto/update-reagent.dto';

@ApiTags('reagents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reagents')
export class ReagentsController {
  constructor(private readonly reagentService: ReagentsService) {}

  @ApiOperation({
    summary: 'Listar todos los reactivos',
    description:
      'Retorna la lista completa de reactivos del inventario. Cualquier usuario autenticado (ADMIN, SCIENTIST u OPERATOR) puede consultar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reactivos.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Ácido sulfúrico',
          formula: 'H2SO4',
          stock: 500,
          unit: 'ml',
          expirationDate: '2026-12-31T00:00:00.000Z',
          entryDate: '2026-05-08T16:00:00.000Z',
          observations: 'Almacenar en lugar fresco y seco.',
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
    return this.reagentService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener un reactivo por ID',
    description:
      'Retorna los detalles de un reactivo específico. Cualquier usuario autenticado puede consultar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del reactivo a consultar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reactivo encontrado.',
    schema: {
      example: {
        id: 1,
        name: 'Ácido sulfúrico',
        formula: 'H2SO4',
        stock: 500,
        unit: 'ml',
        expirationDate: '2026-12-31T00:00:00.000Z',
        entryDate: '2026-05-08T16:00:00.000Z',
        observations: 'Almacenar en lugar fresco y seco.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un reactivo con ese ID.',
    schema: {
      example: {
        message: 'Reagent con 99 no encontrado',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reagentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Crear un nuevo reactivo',
    description:
      'Registra un reactivo nuevo en el inventario. Solo usuarios con rol ADMIN u OPERATOR pueden crear reactivos.',
  })
  @ApiBody({
    type: CreateReagentDto,
    examples: {
      acido: {
        summary: 'Crear ácido sulfúrico',
        value: {
          name: 'Ácido sulfúrico',
          formula: 'H2SO4',
          stock: 500,
          unit: 'ml',
          expirationDate: '2026-12-31',
          observations: 'Almacenar en lugar fresco y seco.',
        },
      },
      sinFormula: {
        summary: 'Reactivo sin fórmula (formula opcional)',
        value: {
          name: 'Solución buffer pH 7',
          stock: 1000,
          unit: 'ml',
          expirationDate: '2027-06-30',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reactivo creado correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Ácido sulfúrico',
        formula: 'H2SO4',
        stock: 500,
        unit: 'ml',
        expirationDate: '2026-12-31T00:00:00.000Z',
        entryDate: '2026-05-08T16:00:00.000Z',
        observations: 'Almacenar en lugar fresco y seco.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos. El body no cumple con las validaciones del DTO (formato de fecha, stock negativo, unidad inválida, etc.).',
    schema: {
      example: {
        message: [
          'stock must not be less than 0',
          'unit must be one of: g, ml, L, mg, kg',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN ni OPERATOR.',
    schema: {
      example: {
        message: 'No tienes permisos suficientes',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Post()
  create(@Body() dto: CreateReagentDto) {
    return this.reagentService.create(dto);
  }

  @ApiOperation({
    summary: 'Actualizar un reactivo',
    description:
      'Modifica uno o varios campos de un reactivo existente. Todos los campos del body son opcionales (solo se actualizan los que envíes). Solo usuarios con rol ADMIN u OPERATOR pueden actualizar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del reactivo a actualizar.',
    example: 1,
  })
  @ApiBody({
    type: UpdateReagentDto,
    examples: {
      ajusteStock: {
        summary: 'Solo ajustar stock',
        value: { stock: 750 },
      },
      cambioCompleto: {
        summary: 'Actualizar varios campos',
        value: {
          name: 'Ácido sulfúrico (concentrado)',
          stock: 750,
          observations: 'Reposicionado el 2026-05-08',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reactivo actualizado correctamente.',
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
    description: 'No existe un reactivo con ese ID.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReagentDto) {
    return this.reagentService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Eliminar un reactivo',
    description:
      'Elimina permanentemente un reactivo del inventario. Solo usuarios con rol ADMIN u OPERATOR pueden eliminar.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del reactivo a eliminar.',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Reactivo eliminado correctamente. Sin contenido.',
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
    description: 'No existe un reactivo con ese ID.',
  })
  @Roles(Role.ADMIN, Role.OPERATOR)
  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.reagentService.remove(id);
  }
}
