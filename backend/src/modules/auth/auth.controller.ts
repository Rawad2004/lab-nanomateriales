import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/User.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea un usuario en el sistema. El email debe ser único. La contraseña se almacena hasheada con bcrypt; nunca se guarda ni se devuelve en texto plano.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      cientifico: {
        summary: 'Registro de un científico',
        value: {
          name: 'Juan Pérez',
          email: 'juan.perez@nanolab.com',
          password: 'MiPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente.',
    schema: {
      example: 'User Successfully Registered',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos o email ya existente. Posibles causas: email duplicado, formato de email inválido, contraseña con menos de 8 caracteres, o nombre con menos de 3 caracteres.',
    schema: {
      example: {
        message: 'User Already Exists',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @Post('register')
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }
    */

  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida credenciales y devuelve un JWT que debe enviarse en el header Authorization (Bearer) para acceder a los endpoints protegidos. El token expira en 8 horas.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        summary: 'Login como administrador',
        value: {
          email: 'admin@nanolab.com',
          password: 'Admin1234',
        },
      },
      cientifico: {
        summary: 'Login como científico',
        value: {
          email: 'maria.lopez@nanolab.com',
          password: 'Scientist1234',
        },
      },
      operador: {
        summary: 'Login como operador',
        value: {
          email: 'carlos.ruiz@nanolab.com',
          password: 'Operator1234',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Login exitoso. Retorna el user autenticado y el access_token.',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'admin@nanolab.com',
          name: 'Admin Lab',
          role: 'ADMIN',
        },
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AbmFub2xhYi5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTAwMDAwMDAsImV4cCI6MTcxMDAyODgwMH0.signature',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas (la contraseña no coincide).',
    schema: {
      example: {
        message: 'Invalid Credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No existe un usuario con el email enviado.',
    schema: {
      example: {
        message: 'User Not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Post('login')
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener el perfil del usuario autenticado',
    description:
      'Retorna los datos del usuario que pertenece al JWT enviado en el header Authorization. Útil para que el frontend recupere su sesión al recargar la página o para verificar que el token sigue siendo válido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del usuario autenticado (sin password).',
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
    description:
      'Token no enviado, malformado, expirado, o el usuario asociado al token está desactivado o ya no existe.',
    schema: {
      example: {
        message: 'No autorizado',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @CurrentUser()
    user: User,
  ) {
    return user;
  }
}
