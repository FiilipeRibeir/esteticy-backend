import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Work } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { WorkCreateSchema, WorkGetOneSchema, WorkUpdateProps, WorkUpdateSchema } from '../interface/work_interface';
import { WorkService } from '../service/work.service';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: unknown): Promise<Work> {
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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllOrFiltered(@Query() filters: unknown): Promise<Work[]> {
    const parsedFilters = WorkGetOneSchema.safeParse(filters);

    if (parsedFilters.success) {
      return this.workService.getFilteredWorks(parsedFilters.data);
    }

    return this.workService.getWorks();
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
