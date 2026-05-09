import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashService } from 'src/common/services/hash.service';
import { User } from './entities/User.entity';
import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
