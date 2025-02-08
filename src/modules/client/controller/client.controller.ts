import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Client } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';
import { ClientCreateProps, ClientCreateSchema } from '../interface/client_interface';
import { ClientService } from '../service/client.service';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) { }

  @Post()
  async createClient(@Body() data: unknown): Promise<Client> {
    const parsedData = ClientCreateSchema.safeParse(data);

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    return this.clientService.createClient(parsedData.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllClients(): Promise<Client[]> {
    return this.clientService.findAllClients();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getClientById(@Param('id') id: string): Promise<Client | null> {
    return this.clientService.findClientById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() data: Partial<ClientCreateProps>) {
    const result = ClientCreateSchema.partial().safeParse(data);

    if (!result.success) {
      throw new BadRequestException(result.error.errors.map((e) => e.message).join(", "));
    }

    return this.clientService.updateClient({ id, ...data });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    return this.clientService.deleteClient(id);
  }
}
