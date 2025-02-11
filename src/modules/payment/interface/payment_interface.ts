import { EventEmitter } from "events"; 

export interface PaymentCreateProps {
  userId: string;
  external_reference: string;
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
}

export interface PaymentWebhookProps {
  resource: string;
  topic: string;
}

export interface PaymentProvider {
  createPayment(data: PaymentCreateProps): Promise<any>;
  webhook(data: PaymentWebhookProps): Promise<any>;
}

export const paymentEvents = new EventEmitter(); 
