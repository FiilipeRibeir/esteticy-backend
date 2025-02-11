import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentCreateProps, PaymentProvider } from '../../interface/payment_interface';

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  private readonly logger = new Logger(MercadoPagoProvider.name);

  constructor(private readonly prisma: PrismaService) { }

  async createPayment(data: PaymentCreateProps) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let mptoken = await this.prisma.mercadoPagoToken.findUnique({ where: { userId: data.userId } });

    if (!mptoken) {
      throw new HttpException('Mercado Pago token not found', HttpStatus.NOT_FOUND);
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL is not defined!');
    }

    const client = new MercadoPagoConfig({
      accessToken: mptoken.accessToken,
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000);

    const body = {
      transaction_amount: data.transactionAmount,
      description: data.description,
      payment_method_id: data.paymentMethodId,
      payer: { email: data.email },
      notification_url: process.env.WEBHOOK_URL,
      external_reference: data.external_reference,
      date_of_expiration: expirationDate.toISOString(),
    };

    const requestOptions = { idempotencyKey: randomUUID() };

    try {
      const response = await payment.create({ body, requestOptions });

      if (!response.id) {
        throw new Error('Transaction ID not returned by Mercado Pago. Invalid payment.');
      }

      const transactionId = response.id.toString();

      const paymentDb = await this.prisma.payment.create({
        data: {
          userId: data.userId,
          appointmentId: data.external_reference,
          amount: data.transactionAmount,
          status: PaymentStatus.PENDENTE,
          method: data.paymentMethodId,
          transactionId: transactionId,
          expiresAt: expirationDate,
        },
      });

      this.logger.log(`Payment created: ${transactionId}`);

      return { mercadoPagoResponse: response, paymentdb: paymentDb };
    } catch (error) {
      this.logger.error(`MercadoPago error: ${error.message}`);
      throw error;
    }
  }

  async webhook(data: { resource: string; topic: string }) {
    if (!data.resource || !data.topic) {
      throw new HttpException('Incomplete data', HttpStatus.BAD_REQUEST);
    }

    try {
      if (data.topic !== 'payment') {
        return { message: 'Event ignored' };
      }

      const payment = await this.prisma.payment.findUnique({
        where: { transactionId: data.resource },
        include: { user: true },
      });

      if (!payment || !payment.user) {
        this.logger.error('Payment or associated user not found', { resource: data.resource });
        throw new HttpException('Payment or user not found', HttpStatus.NOT_FOUND);
      }

      if (payment.expiresAt > new Date()) {
        return { message: 'Pagamento ainda válido' };
      }

      await this.prisma.payment.delete({ where: { transactionId: data.resource } });
      await this.prisma.appointment.delete({ where: { id: payment.appointmentId } });

      this.logger.log(`Payment expired and removed: ${data.resource}`);

      return { message: 'Payment expired and removed from database' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      throw new HttpException('Error processing webhook', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
