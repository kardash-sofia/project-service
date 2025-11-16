import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ProjectService } from './projects.service';
import { CreateProjectDto } from 'src/dto/createProject.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() dto: CreateProjectDto) {
    try {
      return await this.projectService.createProject(dto);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
