import { Module } from '@nestjs/common';
import { ClientController } from './controller/client.controller';
import { ClientService } from './service/client.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ClientService],
  controllers: [ClientController]
})
export class ClientModule { }
