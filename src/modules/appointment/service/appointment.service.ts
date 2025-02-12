import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PaymentService } from 'src/modules/payment/service/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentCreateProps, AppointmentDeleteProps, AppointmentGetOneProps, AppointmentUpdateProps } from '../interface/appointment.interface';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentService
  ) { }

  async createAppointment({ userId, date, workId, email }: AppointmentCreateProps) {
    if (!date) {
      throw new HttpException('Please provide a date', HttpStatus.BAD_REQUEST);
    }
    if (!workId) {
      throw new HttpException('The work ID (workId) is required', HttpStatus.BAD_REQUEST);
    }

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: dayjs(date).subtract(0.9, 'hour').toDate(),
          lte: dayjs(date).add(0.9, 'hour').toDate(),
        },
        status: { not: AppointmentStatus.CANCELADO },
      },
    });

    if (existingAppointments.length > 0) {
      throw new HttpException('There is already an appointment within the one-hour interval.', HttpStatus.BAD_REQUEST);
    }

    const work = await this.prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      throw new HttpException('Work (workId) not found.', HttpStatus.NOT_FOUND);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        title: work.name,
        userId,
        date,
        workId,
        paymentStatus: PaymentStatus.PENDENTE,
      },
    });

    try {
      const payment = await this.paymentsService.createPayment({
        userId,
        external_reference: appointment.id,
        transactionAmount: work.price,
        description: work.name,
        paymentMethodId: 'pix',
        email,
      });

      return { appointment, payment };
    } catch (error) {
      await this.prisma.appointment.delete({ where: { id: appointment.id } });
      throw new HttpException('Error processing payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAppointment({ id }: AppointmentDeleteProps) {
    return this.prisma.appointment.delete({ where: { id } });
  }

  async getAppointments() {
    return this.prisma.appointment.findMany();
  }

  async getFilteredAppointments(filters: AppointmentGetOneProps) {
    return this.prisma.appointment.findMany({ where: filters });
  }

  async updateAppointment({ id, date, status, paymentStatus, paidAmount }: AppointmentUpdateProps) {
    return this.prisma.appointment.update({
      where: { id },
      data: { date, status, paymentStatus, paidAmount },
    });
  }
}
