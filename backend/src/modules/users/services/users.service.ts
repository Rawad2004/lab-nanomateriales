import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HashService } from 'src/common/services/hash.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/User.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly hashService: HashService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crea un usuario nuevo. Si el email ya existe → 409 Conflict.
   * El password se almacena hasheado con bcrypt; nunca en texto plano.
   * Retorna el User creado SIN password.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${createUserDto.email}`,
      );
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: await this.hashService.hash(createUserDto.password),
    });

    const saved = await this.userRepository.save(user);
    return this.stripPassword(saved);
  }

  /**
   * Lista usuarios. Por defecto solo activos.
   * El password nunca se incluye en el query (gracias a `select`).
   */
  async findAll(includeInactive = false): Promise<User[]> {
    return this.userRepository.find({
      where: includeInactive ? {} : { isActive: true },
      select: this.publicFields(),
    });
  }

  /**
   * Busca un usuario por email INCLUYENDO el password.
   * Es un método interno usado por AuthService para login —
   * NO debe exponerse por API porque retorna el hash.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  /**
   * Busca un usuario por id, EXCLUYENDO el password.
   * Usado por JwtStrategy y por endpoints públicos.
   */
  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: this.publicFields(),
    });
  }

  /**
   * Actualiza name, email o role de un usuario.
   * NO permite cambiar password (excluido del DTO).
   * Si se cambia el email, valida que no esté en uso por OTRO usuario.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      const existing = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `El email ${updateUserDto.email} ya está en uso`,
        );
      }
    }

    const user = await this.userRepository.preload({ id, ...updateUserDto });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const saved = await this.userRepository.save(user);
    return this.stripPassword(saved);
  }

  /**
   * Soft delete: marca isActive = false.
   * El usuario queda en BD (para no romper FKs en órdenes históricas)
   * pero no podrá loguearse ni aparecer en listados activos.
   */
  async deactivate(id: number): Promise<User> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

  /**
   * Helper: object con los campos "públicos" (sin password) para usar en `select`.
   * Centraliza la definición — si agregas un campo nuevo a User, lo agregas acá.
   */
  private publicFields(): {
    id: true;
    email: true;
    name: true;
    role: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
  } {
    return {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Helper: elimina la propiedad password de un User para que no se devuelva
   * en responses. Se usa después de `save()` (que sí trae el hash).
   */
  private stripPassword(user: User): User {
    const { password: _password, ...rest } = user;
    return rest as User;
  }
}
