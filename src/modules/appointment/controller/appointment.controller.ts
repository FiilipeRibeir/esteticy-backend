import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Appointment } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { AppointmentCreateSchema, AppointmentGetSchema, AppointmentUpdateProps, AppointmentUpdateSchema } from '../interface/appointment.interface';
import { AppointmentsService } from '../service/appointment.service';

@Controller('appointment')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: unknown): Promise<any> {
    const parsedData = AppointmentCreateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }
    return this.appointmentsService.createAppointment(parsedData.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.appointmentsService.deleteAppointment({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.appointmentsService.getAppointments();
  }

  @UseGuards(JwtAuthGuard)
  @Get('filtered')
  async getFiltered(@Query() filters: unknown): Promise<Appointment[]> {
    const parsedFilters = AppointmentGetSchema.safeParse(filters);

    if (parsedFilters.success) {
      return this.appointmentsService.getFilteredAppointments(parsedFilters.data);
    }

    return this.appointmentsService.getAppointments(); 
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: unknown): Promise<Appointment> {
    const parsedData = AppointmentUpdateSchema.omit({ id: true }).safeParse(data)
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const updateData: AppointmentUpdateProps = { id, ...parsedData.data }
    return this.appointmentsService.updateAppointment(updateData);
  }
}
