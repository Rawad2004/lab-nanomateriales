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

import { NanomaterialsService } from './service/nanomaterials.service';
import { CreateNanomaterialDto } from './dto/create-nanomaterial.dto';
import { UpdateNanomaterialDto } from './dto/update-nanomaterial.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/Role.enum';

@ApiTags('nanomaterials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nanomaterials')
export class NanomaterialsController {
  constructor(private readonly nanomaterialsService: NanomaterialsService) {}

  @ApiOperation({
    summary: 'Listar todos los nanomateriales',
    description:
      'Retorna el catálogo completo de nanomateriales del laboratorio (activos e inactivos). Cualquier usuario autenticado puede consultar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de nanomateriales.',
    schema: {
      example: [
        {
          id: 1,
          name: 'Nanopartículas de plata',
          description:
            'Nanopartículas con propiedades antimicrobianas obtenidas mediante reducción química de nitrato de plata.',
          properties: {
            size: '20nm',
            color: 'gris',
            shape: 'esférica',
            synthesisMethod: 'Turkevich',
          },
          aplications:
            'Recubrimientos antimicrobianos, sensores biológicos, terapias dirigidas.',
          isActive: true,
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
    return this.nanomaterialsService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener un nanomaterial por ID',
    description:
      'Retorna los detalles de un nanomaterial específico, incluyendo sus propiedades físico-químicas y aplicaciones.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del nanomaterial a consultar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Nanomaterial encontrado.',
    schema: {
      example: {
        id: 1,
        name: 'Nanopartículas de plata',
        description:
          'Nanopartículas con propiedades antimicrobianas obtenidas mediante reducción química de nitrato de plata.',
        properties: {
          size: '20nm',
          color: 'gris',
          shape: 'esférica',
          synthesisMethod: 'Turkevich',
        },
        aplications:
          'Recubrimientos antimicrobianos, sensores biológicos, terapias dirigidas.',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un nanomaterial con ese ID.',
    schema: {
      example: {
        message: 'El nanomaterial con el id 99 no fue encontrado',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nanomaterialsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Crear un nuevo nanomaterial',
    description:
      'Registra un nanomaterial nuevo en el catálogo. Solo usuarios con rol ADMIN pueden crear. Los nanomateriales se crean activos por defecto (isActive: true).',
  })
  @ApiBody({
    type: CreateNanomaterialDto,
    examples: {
      plata: {
        summary: 'Nanopartículas de plata',
        value: {
          name: 'Nanopartículas de plata',
          description:
            'Nanopartículas con propiedades antimicrobianas obtenidas mediante reducción química de nitrato de plata.',
          properties: {
            size: '20nm',
            color: 'gris',
            shape: 'esférica',
            synthesisMethod: 'Turkevich',
          },
          aplications:
            'Recubrimientos antimicrobianos, sensores biológicos, terapias dirigidas.',
        },
      },
      grafeno: {
        summary: 'Grafeno (otro ejemplo)',
        value: {
          name: 'Óxido de grafeno reducido',
          description:
            'Capas bidimensionales de carbono obtenidas por reducción de óxido de grafeno con ácido ascórbico.',
          properties: {
            layers: 2,
            conductivity: 'alta',
            surfaceArea: '600 m2/g',
          },
          aplications:
            'Electrónica flexible, baterías de alta capacidad, supercondensadores.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Nanomaterial creado correctamente.',
    schema: {
      example: {
        id: 1,
        name: 'Nanopartículas de plata',
        description: '...',
        properties: { size: '20nm', color: 'gris' },
        aplications: '...',
        isActive: true,
      },
    },
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
    description: 'El usuario autenticado no tiene rol ADMIN.',
    schema: {
      example: {
        message: 'No tienes permisos suficientes',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateNanomaterialDto) {
    return this.nanomaterialsService.create(dto);
  }

  @ApiOperation({
    summary: 'Actualizar un nanomaterial',
    description:
      'Modifica uno o varios campos de un nanomaterial existente. Todos los campos del body son opcionales. Solo ADMIN puede actualizar. Para activar/desactivar, usar PATCH /:id/toggle-active.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del nanomaterial a actualizar.',
    example: 1,
  })
  @ApiBody({
    type: UpdateNanomaterialDto,
    examples: {
      cambioDescripcion: {
        summary: 'Solo actualizar descripción',
        value: {
          description:
            'Descripción ampliada con nuevos detalles del proceso de síntesis.',
        },
      },
      ajusteProperties: {
        summary: 'Actualizar propiedades',
        value: {
          properties: {
            size: '15nm',
            color: 'amarillo claro',
            shape: 'esférica',
            synthesisMethod: 'Turkevich modificado',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Nanomaterial actualizado correctamente.',
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
    description: 'El usuario autenticado no tiene rol ADMIN.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un nanomaterial con ese ID.',
  })
  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNanomaterialDto,
  ) {
    return this.nanomaterialsService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Eliminar un nanomaterial',
    description:
      'Elimina permanentemente un nanomaterial del catálogo. Solo ADMIN puede eliminar. Considera usar PATCH /:id/toggle-active para "desactivar" en vez de borrar, especialmente si hay órdenes históricas que lo referencian.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del nanomaterial a eliminar.',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Nanomaterial eliminado correctamente. Sin contenido.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un nanomaterial con ese ID.',
  })
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.nanomaterialsService.remove(id);
  }

  @ApiOperation({
    summary: 'Activar o desactivar un nanomaterial',
    description:
      'Cambia el estado isActive del nanomaterial: si está activo lo desactiva, si está inactivo lo activa. Solo ADMIN puede ejecutar esta acción. Esta operación no toca otros campos del nanomaterial.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del nanomaterial a alternar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Nanomaterial con isActive cambiado.',
    schema: {
      example: {
        id: 1,
        name: 'Nanopartículas de plata',
        description: '...',
        properties: { size: '20nm' },
        aplications: '...',
        isActive: false,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario autenticado no tiene rol ADMIN.',
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un nanomaterial con ese ID.',
  })
  @Roles(Role.ADMIN)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.nanomaterialsService.toggleActive(id);
  }
}
