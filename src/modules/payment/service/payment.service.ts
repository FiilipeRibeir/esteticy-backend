import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import PaymentProviderFactory from '../gateway/provider/payment_factory';
import { PaymentCreateProps, paymentEvents, PaymentWebhookProps } from '../interface/payment_interface';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentProviderFactory: PaymentProviderFactory) {
    paymentEvents.on("payment.update", async (data: PaymentWebhookProps) => {
      await this.handlePaymentUpdate(data.resource);
    });
  }

  async createPayment(data: PaymentCreateProps): Promise<any> {
    const provider = this.paymentProviderFactory.getProvider("mercadopago");
    return provider.createPayment(data);
  }

  async webhook(webhookData: any) {
    if (webhookData.resource && webhookData.topic === 'payment') {
      return this.handlePaymentUpdate(webhookData.resource);
    }

    if (webhookData.data && webhookData.data.id) {
      return this.handlePaymentUpdate(webhookData.data.id);
    }
    throw new HttpException('Incomplete data', HttpStatus.BAD_REQUEST);
  }

  async handlePaymentUpdate(paymentId: string) {
    return { message: `Pagamento ${paymentId} processado com sucesso` };
  }
}
