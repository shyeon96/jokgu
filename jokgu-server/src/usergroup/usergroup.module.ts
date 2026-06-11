import { Module } from '@nestjs/common';
import { UsergroupService } from './usergroup.service';
import { UsergroupController } from './usergroup.controller';

@Module({
  controllers: [UsergroupController],
  providers: [UsergroupService],
})
export class UsergroupModule {}
