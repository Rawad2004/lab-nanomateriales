import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HashService } from 'src/common/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../users/enums/Role.enum';
import { UsersService } from '../users/services/users.service';

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: Role;
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findOneByEmail(registerDto.email);

    if (user) {
      throw new BadRequestException('User Already Exists');
    }

    // Auto-registrados reciben rol SCIENTIST por default.
    // Esta vía debería evaluarse para borrarse en Paso 9 — los usuarios
    // deberían crearse vía POST /api/users por un admin.
    return await this.usersService.create({
      ...registerDto,
      role: Role.SCIENTIST,
    });
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException('User Not found');
    }

    const isMatch = await this.hashService.compare(
      loginDto.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const { id, email, name, role } = user;
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return {
      user: { id, email, name, role },
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
