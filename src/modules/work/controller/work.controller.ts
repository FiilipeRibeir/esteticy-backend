import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { Work } from '@prisma/client';
import { WorkCreateSchema, WorkGetOneSchema, WorkUpdateProps, WorkUpdateSchema } from '../interface/work_interface';
import { WorkService } from '../service/work.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() data: unknown): Promise<Work> {
    const parsedData = WorkCreateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    return this.workService.createWork(parsedData.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.workService.deleteWork({ id });
  }

  @Get()
  async getAll(): Promise<Work[]> {
    return this.workService.getWorks();
  }

  @Get('filtered')
  async getFiltered(@Query() filters: unknown): Promise<Work[]> {
    const parsedFilters = WorkGetOneSchema.safeParse(filters);
    if (!parsedFilters.success) {
      throw new BadRequestException(parsedFilters.error.errors);
    }
    return this.workService.getFilteredWorks(parsedFilters.data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: unknown): Promise<Work> {
    const parsedData = WorkUpdateSchema.omit({ id: true }).safeParse(data);

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const updateData: WorkUpdateProps = { id, ...parsedData.data };
    return this.workService.updateWork(updateData);
  }
}
