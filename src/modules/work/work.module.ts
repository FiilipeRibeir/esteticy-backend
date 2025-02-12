import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkController } from './controller/work.controller';
import { WorkService } from './service/work.service';

@Module({
  imports: [PrismaModule],
  providers: [WorkService],
  controllers: [WorkController]
})
export class WorkModule { }
