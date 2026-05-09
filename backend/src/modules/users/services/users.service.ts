import { Injectable } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      ...createUserDto,
      password: await this.hashService.hash(createUserDto.password),
    });

    await this.userRepository.save(user);

    return 'User Successfully Registered';
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    return user;
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.userRepository.findBy({ id });

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(updateUserDto);
    return 'User Updated';
  }
}
