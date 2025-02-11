import { Module } from '@nestjs/common';
import { MercadopagoController } from './controller/mercadopago.controller';
import { MercadopagoService } from './service/mercadopago.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MercadopagoController],
  providers: [MercadopagoService]
})
export class MercadopagoModule { }
