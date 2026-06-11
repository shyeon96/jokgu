import { Module } from '@nestjs/common';
import { UserplanService } from './userplan.service';
import { UserplanController } from './userplan.controller';

@Module({
  controllers: [UserplanController],
  providers: [UserplanService],
})
export class UserplanModule {}
