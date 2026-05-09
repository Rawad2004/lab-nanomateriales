/**
 * Seed: inserta 3 usuarios base (uno por cada rol) en la BD.
 *
 * Uso:
 *   npm run seed
 *
 * Limpia la tabla `user` y la repuebla con los usuarios definidos en
 * USUARIOS_BASE. Los passwords se hashean con bcrypt (10 rounds), los
 * mismos parámetros que usa HashService en runtime.
 */

import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../app.module';
import { User } from '../modules/users/entities/User.entity';
import { Role } from '../modules/users/enums/Role.enum';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const USUARIOS_BASE: SeedUser[] = [
  {
    name: 'Admin Lab',
    email: 'admin@nanolab.com',
    password: 'Admin1234',
    role: Role.ADMIN,
  },
  {
    name: 'María López',
    email: 'maria.lopez@nanolab.com',
    password: 'Scientist1234',
    role: Role.SCIENTIST,
  },
  {
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@nanolab.com',
    password: 'Operator1234',
    role: Role.OPERATOR,
  },
];

async function seed(): Promise<void> {
  // 1. Arrancamos el contexto de Nest sin servidor HTTP.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  // 2. Pedimos el repositorio de User a través del DI container.
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  // 3. Limpiamos la tabla (TRUNCATE). Idempotencia: cada ejecución parte de cero.
  //    Desactivamos FK_CHECKS temporalmente porque la tabla `user` está
  //    referenciada por FKs de otras entidades (ej: order.creadoPor → user.id).
  //    MySQL prohíbe TRUNCATE en tablas referenciadas con FK activas.
  console.log('🧹 Limpiando tabla de usuarios...');
  await userRepo.query('SET FOREIGN_KEY_CHECKS = 0');
  await userRepo.clear();
  await userRepo.query('SET FOREIGN_KEY_CHECKS = 1');

  // 4. Insertamos los 3 usuarios base.
  console.log('🌱 Insertando usuarios base...\n');
  for (const u of USUARIOS_BASE) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = userRepo.create({ ...u, password: hashedPassword });
    await userRepo.save(user);
    console.log(
      `  ✅ ${u.email.padEnd(28)} (${u.role.padEnd(10)}) password: ${u.password}`,
    );
  }

  // 5. Cerramos limpiamente el contexto (libera la conexión a MySQL).
  await app.close();
  console.log('\n🎉 Seed completado correctamente.\n');
}

seed().catch((err: unknown) => {
  console.error('❌ Error al ejecutar el seed:', err);
  process.exit(1);
});
