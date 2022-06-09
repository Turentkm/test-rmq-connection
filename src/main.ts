import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  Logger.log('Connecting microservics');
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        {
          protocol: 'amqp',
          hostname: process.env.RABBITMQ_HOST,
          port: 5672,
          username: process.env.RABBITMQ_USERNAME + 's',
          password: process.env.RABBITMQ_PASSWORD,
        },
      ],
      queue: 'resources_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  Logger.log('Starting microservices');
  await app.startAllMicroservices();
  Logger.log('Finalizing start of microservices');
  await app.listen(3000);
}
bootstrap();
