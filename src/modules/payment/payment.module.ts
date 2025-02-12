import { Module } from '@nestjs/common';
import { PaymentService } from './service/payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import PaymentProviderFactory from './gateway/provider/payment_factory';

@Module({
  imports: [PrismaModule],
  providers: [PaymentService, PaymentProviderFactory],
  exports: [PaymentService],
})
export class PaymentModule { }
