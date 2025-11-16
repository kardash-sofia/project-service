import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Project } from 'src/entities/project.entity';
import { ProjectService } from './projects.service';
import { ProjectController } from './projects.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'PROJECT_BROKER',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: configService.get<string>('PROJECT_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
