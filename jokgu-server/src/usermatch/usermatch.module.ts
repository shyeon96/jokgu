import { Module } from '@nestjs/common';
import { UsermatchService } from './usermatch.service';
import { UsermatchController } from './usermatch.controller';

@Module({
  controllers: [UsermatchController],
  providers: [UsermatchService],
})
export class UsermatchModule {}
