import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('NanoLab API')
    .setVersion('1.0')
    .setDescription('API para la gestión de un laboratorio de nanomateriales')
    .build();

  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log(
    '✅ Corriendo en el puerto: ',
    'http://localhost:' + (process.env.PORT ?? 3000) + '/api/docs',
  );
}
bootstrap();
