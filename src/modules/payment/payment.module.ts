import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaymentController } from './controller/payment.controller';
import PaymentProviderFactory from './gateway/provider/payment_factory';
import { PaymentService } from './service/payment.service';

@Module({
  imports: [PrismaModule], 
  providers: [PaymentService, PaymentProviderFactory],
  controllers: [PaymentController],
})
export class PaymentModule {}
