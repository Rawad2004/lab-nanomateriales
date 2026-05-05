import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ReactivosModule } from './modules/reactivos/reactivos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EquipamientoModule } from './modules/equipamiento/equipamiento.module';
import { NanomaterialesModule } from './modules/nanomateriales/nanomateriales.module';
import { OrdenesModule } from './modules/ordenes/ordenes.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3307'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ReactivosModule,
    DashboardModule,
    EquipamientoModule,
    NanomaterialesModule,
    OrdenesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
