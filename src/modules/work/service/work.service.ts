import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorkCreateProps, WorkCreateSchema, WorkDeleteProps, WorkDeleteSchema, WorkGetOneProps, WorkGetOneSchema, WorkUpdateProps, WorkUpdateSchema } from '../interface/work_interface';

@Injectable()
export class WorkService {
  constructor(private prisma: PrismaService) { }

  async createWork(data: WorkCreateProps) {
    const parsedData = WorkCreateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const { userId, name, description, price } = parsedData.data;
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.work.create({ data: { userId, name, description, price } });
  }

  async deleteWork(data: WorkDeleteProps) {
    const parsedData = WorkDeleteSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const { id } = parsedData.data;
    const existingWork = await this.prisma.work.findUnique({ where: { id } });

    if (!existingWork) {
      throw new NotFoundException('Trabalho não encontrado');
    }

    await this.prisma.work.delete({ where: { id } });
    return { message: 'Trabalho deletado com sucesso' };
  }

  async getWorks() {
    return this.prisma.work.findMany();
  }

  async getFilteredWorks(filters: WorkGetOneProps) {
    const parsedData = WorkGetOneSchema.safeParse(filters);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const where: any = {};
    if (parsedData.data.name) {
      where.name = { contains: parsedData.data.name, mode: 'insensitive' };
    }
    if (parsedData.data.description) {
      where.description = { contains: parsedData.data.description, mode: 'insensitive' };
    }
    if (parsedData.data.userId) {
      where.userId = parsedData.data.userId;
    }

    return this.prisma.work.findMany({ where });
  }

  async updateWork(data: WorkUpdateProps) {
    const parsedData = WorkUpdateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const { id, name, description, price } = parsedData.data;
    const existingWork = await this.prisma.work.findUnique({ where: { id } });

    if (!existingWork) {
      throw new NotFoundException('Trabalho não encontrado');
    }

    return this.prisma.work.update({
      where: { id },
      data: { name, description, price },
    });
  }
}
