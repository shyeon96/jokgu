import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PlansRepository } from './plans.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entity/plan.entity';
import { UserPlan } from 'src/userplan/entity/userplan.entity';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, UserPlan]), MatchesModule],
  controllers: [PlansController],
  providers: [PlansService, PlansRepository],
  exports: [PlansService]
})
export class PlansModule {}
