import { Body, Controller, Post } from '@nestjs/common';
import { PaymentCreateProps, PaymentWebhookProps } from '../interface/payment_interface';
import { PaymentService } from '../service/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create')
  async createPayment(@Body() paymentData: PaymentCreateProps) {
    return this.paymentService.createPayment(paymentData);
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: PaymentWebhookProps) {
    return this.paymentService.webhook(webhookData);
  }
}