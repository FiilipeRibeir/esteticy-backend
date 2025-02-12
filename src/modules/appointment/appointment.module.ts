import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';
import { AppointmentsController } from './controller/appointment.controller';
import { AppointmentsService } from './service/appointment.service';

@Module({
  imports: [PrismaModule, PaymentModule],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentModule {}
