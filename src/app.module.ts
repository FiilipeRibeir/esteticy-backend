import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import { WorkModule } from './modules/work/work.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UserModule, ClientModule, WorkModule, AppointmentModule, PaymentModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
