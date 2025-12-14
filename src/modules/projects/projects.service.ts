import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateProjectDto } from 'src/dto/createProject.dto';
import { Project } from 'src/entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject('PROJECT_BROKER')
    private client: ClientProxy,
  ) {}

  async getProjects({ page = 1, limit = 10 }) {
    const [projects, total] = await this.projectRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: projects,
      total,
    };
  }

  async handleProjectCreatedEvent(dto: CreateProjectDto) {
    console.log('[SERVICE] Handling AMQP event:', dto);

    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  sendToQueue(dto: CreateProjectDto) {
    console.log('[SERVICE] Sending to AMQP queue:', dto);
    this.client.emit('project_created', dto);
  }

  async createProject(dto: CreateProjectDto) {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');

    const userRes = await this.httpService
      .get(`${userServiceUrl}/users/${dto.ownerId}`)
      .toPromise();

    if (!userRes?.data) {
      throw new Error('User not found');
    }

    const project = this.projectRepo.create(dto);
    const savedProject = await this.projectRepo.save(project);

    return savedProject;
  }
}
