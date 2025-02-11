import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/controller/auth.controller';
import { ClientModule } from './modules/client/client.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UserModule } from './modules/user/user.module';
import { WorkModule } from './modules/work/work.module';
import { PrismaModule } from './prisma/prisma.module';
import { MercadopagoModule } from './modules/mercadopago/mercadopago.module';

@Module({
  imports: [UserModule, ClientModule, WorkModule, AppointmentModule, PaymentModule, PrismaModule, AuthModule, MercadopagoModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule { }
