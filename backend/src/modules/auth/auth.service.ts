import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HashService } from 'src/common/services/hash.service';
import { JwtService } from '@nestjs/jwt';

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

    return await this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
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

    const { password, ...result } = user;
    const payload = { sub: user.id, name: user.name, email: user.email };
    return {
      ...result,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
