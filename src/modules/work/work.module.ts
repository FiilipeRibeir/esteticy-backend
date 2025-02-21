import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { WorkController } from './controller/work.controller';
import { WorkService } from './service/work.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [WorkService],
  controllers: [WorkController],
})
export class WorkModule { }
