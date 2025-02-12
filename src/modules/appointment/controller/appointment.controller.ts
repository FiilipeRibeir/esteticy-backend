import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppointmentCreateProps, AppointmentDeleteProps } from '../interface/appointment.interface';
import { AppointmentsService } from '../service/appointment.service';

@Controller('appointment')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  async create(@Body() data: AppointmentCreateProps) {
    return this.appointmentsService.createAppointment(data);
  }

  @Delete()
  async delete(@Query() query: AppointmentDeleteProps) {
    return this.appointmentsService.deleteAppointment(query);
  }

  @Get()
  async getAll() {
    return this.appointmentsService.getAppointments();
  }
}
