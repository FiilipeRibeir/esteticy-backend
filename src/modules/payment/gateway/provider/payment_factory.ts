import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PaymentProvider } from "../../interface/payment_interface";
import { MercadoPagoProvider } from "../mercadopago/mp_gateway";

@Injectable()
export default class PaymentProviderFactory {
  constructor(private readonly prisma: PrismaService) {}

  getProvider(providerName: string): PaymentProvider {
    switch (providerName) {
      case "mercadopago":
        return new MercadoPagoProvider(this.prisma);
      default:
        throw new Error("Unsupported payment provider");
    }
  }
}
