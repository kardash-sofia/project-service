import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProjectService } from './projects.service';
import * as amqp from 'amqplib';
import { CreateProjectDto } from 'src/dto/createProject.dto';

@Injectable()
export class AmqpConsumerService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly projectService: ProjectService) {}

  async onModuleInit() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');

    this.channel = await this.connection.createChannel();

    const queue = 'project_created';

    await this.channel.assertQueue(queue, { durable: true });

    console.log('[AMQP] Waiting in queue:', queue);

    this.channel.consume(queue, async (msg: any) => {
      console.log('[AMQP] Message received');
      console.log(msg);
      if (!msg) return;

      try {
        const dto: CreateProjectDto = JSON.parse(msg.content.toString()).data;

        console.log('[AMQP] Received message:', dto);

        await this.projectService.handleProjectCreatedEvent(dto);

        this.channel.ack(msg);
      } catch (e) {
        console.error('[AMQP] Error parsing message:', e);
        this.channel.nack(msg, false, false);
      }
    });
  }
}
