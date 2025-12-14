import { Controller, Post, Body, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { CreateProjectDto } from 'src/dto/createProject.dto';
import { GetProjectsDto } from 'src/dto/getProjects.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(@Query() query: GetProjectsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    try {
      return await this.projectService.getProjects({ page, limit });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('http')
  async createProject(@Body() dto: CreateProjectDto) {
    try {
      return await this.projectService.createProject(dto);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('amqp')
  createProjectAmqp(@Body() dto: CreateProjectDto) {
    console.log('[CONTROLLER] Queuing project creation via AMQP:', dto);
    this.projectService.sendToQueue(dto);
    return { message: 'Project queued' };
  }
}
