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

    this.client.emit('PROJECT_CREATED', {
      projectId: savedProject.id,
      clientId: dto.ownerId,
      title: savedProject.title,
    });

    return savedProject;
  }
}
