import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientCreateProps, ClientUpdateProps } from '../interface/client_interface';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) { }

  async createClient(data: ClientCreateProps): Promise<Client> {
    return this.prisma.client.create({
      data,
    });
  }

  async findClientByPhone(phone: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { phone },
    });
  }

  async findClientById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  async findAllClients(): Promise<Client[]> {
    return this.prisma.client.findMany();
  }

  async updateClient(data: ClientUpdateProps): Promise<Client> {
    const { id, ...updateData } = data;
    return this.prisma.client.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteClient(id: string): Promise<Client> {
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
