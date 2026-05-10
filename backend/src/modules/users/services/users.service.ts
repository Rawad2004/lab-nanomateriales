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

  async findAll(includeInactive = false): Promise<User[]> {
    return this.userRepository.find({
      where: includeInactive ? {} : { isActive: true },
      select: this.publicFields(),
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: this.publicFields(),
    });
  }

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

  async deactivate(id: number): Promise<User> {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

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
