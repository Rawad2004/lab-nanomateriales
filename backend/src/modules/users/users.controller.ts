import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/User.entity';
import { Role } from './enums/Role.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Listar todos los usuarios (solo ADMIN)',
    description:
      'Retorna la lista de usuarios. Por defecto solo activos. Para incluir desactivados, usar ?includeInactive=true.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Si true, incluye usuarios desactivados (isActive: false).',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios (sin password).',
    schema: {
      example: [
        {
          id: 1,
          email: 'admin@nanolab.com',
          name: 'Admin Lab',
          role: 'ADMIN',
          isActive: true,
          createdAt: '2026-05-07T20:00:00.000Z',
          updatedAt: '2026-05-07T20:00:00.000Z',
        },
      ],
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
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.usersService.findAll(includeInactive === 'true');
  }

  @ApiOperation({
    summary: 'Obtener el perfil del usuario autenticado',
    description:
      'Retorna el user que pertenece al token. Cualquier usuario autenticado (independiente del rol) puede consultar su propio perfil.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario autenticado.',
    schema: {
      example: {
        id: 1,
        email: 'admin@nanolab.com',
        name: 'Admin Lab',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-05-07T20:00:00.000Z',
        updatedAt: '2026-05-07T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token no enviado, inválido o expirado.',
  })
  @Get('me')
  findMe(@CurrentUser() user: User) {
    return user;
  }

  @ApiOperation({
    summary: 'Obtener un usuario por ID (solo ADMIN)',
    description: 'Retorna los detalles de un usuario específico, sin password.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del usuario a consultar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
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
    description: 'No existe un usuario con ese ID.',
    schema: {
      example: {
        message: 'Usuario con id 99 no encontrado',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  @ApiOperation({
    summary: 'Crear un nuevo usuario (solo ADMIN)',
    description:
      'Crea un usuario en el sistema. El email debe ser único. La contraseña se almacena hasheada con bcrypt; nunca se guarda ni se devuelve en texto plano.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      operador: {
        summary: 'Crear un operador',
        value: {
          name: 'Sofía Castro',
          email: 'sofia.castro@nanolab.com',
          password: 'Operator1234',
          role: 'OPERATOR',
        },
      },
      cientifico: {
        summary: 'Crear un científico',
        value: {
          name: 'Luis Fernández',
          email: 'luis.fernandez@nanolab.com',
          password: 'Scientist1234',
          role: 'SCIENTIST',
        },
      },
      admin: {
        summary: 'Crear otro administrador',
        value: {
          name: 'Patricia Gómez',
          email: 'patricia.gomez@nanolab.com',
          password: 'AdminPass1234',
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente (sin password en el response).',
    schema: {
      example: {
        id: 4,
        email: 'sofia.castro@nanolab.com',
        name: 'Sofía Castro',
        role: 'OPERATOR',
        isActive: true,
        createdAt: '2026-05-09T16:00:00.000Z',
        updatedAt: '2026-05-09T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos. Email mal formateado, password muy corta, rol no válido, etc.',
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
    status: 409,
    description: 'Ya existe un usuario con ese email.',
    schema: {
      example: {
        message: 'Ya existe un usuario con el email sofia.castro@nanolab.com',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({
    summary: 'Actualizar un usuario (solo ADMIN)',
    description:
      'Modifica name, email o role de un usuario. La password NO se puede cambiar por este endpoint (debe usarse un endpoint dedicado, pendiente de implementar). Si se cambia el email, valida unicidad.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del usuario a actualizar.',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      cambioRol: {
        summary: 'Promover a administrador',
        value: { role: 'ADMIN' },
      },
      cambioNombre: {
        summary: 'Cambio de nombre',
        value: { name: 'Sofía Castro Pérez' },
      },
      cambioEmail: {
        summary: 'Cambio de email',
        value: { email: 'sofia.castro.perez@nanolab.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente.',
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
    description: 'No existe un usuario con ese ID.',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está en uso por otro usuario.',
  })
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Desactivar un usuario (solo ADMIN)',
    description:
      'Soft delete: marca isActive = false. El usuario no podrá loguearse ni aparecer en listados activos. Los datos quedan en BD para preservar integridad histórica de órdenes referenciadas.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del usuario a desactivar.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Usuario desactivado. Retorna el user con isActive: false confirmado.',
    schema: {
      example: {
        id: 4,
        email: 'sofia.castro@nanolab.com',
        name: 'Sofía Castro',
        role: 'OPERATOR',
        isActive: false,
        createdAt: '2026-05-09T16:00:00.000Z',
        updatedAt: '2026-05-09T16:30:00.000Z',
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
    description: 'No existe un usuario con ese ID.',
  })
  @Roles(Role.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deactivate(id);
  }
}
