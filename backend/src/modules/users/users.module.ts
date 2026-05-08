import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { HashService } from 'src/common/services/hash.service';
import { User } from './entities/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
