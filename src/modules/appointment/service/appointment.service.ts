import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PaymentService } from 'src/modules/payment/service/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentCreateProps, AppointmentDeleteProps, AppointmentDeleteSchema, AppointmentGetProps, AppointmentGetSchema, AppointmentUpdateProps, AppointmentUpdateSchema } from '../interface/appointment.interface';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentService
  ) { }

  async createAppointment(data: AppointmentCreateProps) {
    if (!data.date) {
      throw new HttpException('Please provide a date', HttpStatus.BAD_REQUEST);
    }
    if (!data.workId) {
      throw new HttpException('The work ID (workId) is required', HttpStatus.BAD_REQUEST);
    }

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: dayjs(data.date).subtract(0.9, 'hour').toDate(),
          lte: dayjs(data.date).add(0.9, 'hour').toDate(),
        },
        status: { not: AppointmentStatus.CANCELADO },
      },
    });

    if (existingAppointments.length > 0) {
      throw new HttpException('There is already an appointment within the one-hour interval.', HttpStatus.BAD_REQUEST);
    }

    const work = await this.prisma.work.findUnique({ where: { id: data.workId } });
    if (!work) {
      throw new HttpException('Work (workId) not found.', HttpStatus.NOT_FOUND);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        title: work.name,
        userId: data.userId,
        date: data.date,
        workId: data.workId,
        paymentStatus: PaymentStatus.PENDENTE,
      },
    });

    try {
      const payment = await this.paymentsService.createPayment({
        userId: data.userId,
        external_reference: appointment.id,
        transactionAmount: work.price,
        description: work.name,
        paymentMethodId: 'pix',
        email: data.email,
      });

      return { appointment, payment };
    } catch (error) {
      await this.prisma.appointment.delete({ where: { id: appointment.id } });
      throw new HttpException('Error processing payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAppointment(data: AppointmentDeleteProps) {
    const parsedData = AppointmentDeleteSchema.safeParse(data)
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const { id } = parsedData.data;
    const existingAppointment = await this.prisma.appointment.findUnique({ where: { id } })

    if (!existingAppointment) {
      throw new NotFoundException('Compromisso não encontrado');
    }

    await this.prisma.appointment.delete({ where: { id } });
    return { message: 'Compromisso deletado com sucesso' };
  }

  async getAppointments() {
    return this.prisma.appointment.findMany();
  }

  async getFilteredAppointments(filters: AppointmentGetProps) {
    const parsedData = AppointmentGetSchema.safeParse(filters);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const where: any = {};

    if (parsedData.data.userId) {
      where.userId = parsedData.data.userId;
    }

    if (parsedData.data.date) {
      const rawDate = parsedData.data.date;

      const dateValue = dayjs(rawDate).subtract(-1, 'day').startOf('day'); 

      if (!dateValue.isValid()) {
        console.log('Data inválida:', rawDate);
        throw new BadRequestException('Data inválida');
      }

      const startOfDay = dateValue.toDate(); 
      const endOfDay = dateValue.endOf('day').toDate();  

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.appointment.findMany({ where });
  }

  async updateAppointment(data: AppointmentUpdateProps) {
    const parsedData = AppointmentUpdateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const { id, date, status, paymentStatus, paidAmount } = parsedData.data;
    const existingAppointment = await this.prisma.appointment.findUnique({ where: { id } })

    if (!existingAppointment) {
      throw new NotFoundException('Compromisso não encontrado');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { date, status, paymentStatus, paidAmount },
    });
  }
}
