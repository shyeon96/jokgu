import { Body, Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreateMatchDto } from 'src/matches/dto/CreateMatchDto';
import { MatchesService } from 'src/matches/matches.service';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly matchesService: MatchesService
  ) {}

  @Get()
  findScheduledPlan(@Request() req) {
    return this.plansService.findScheduledPlan(req.user.id);
  }

  @Get(':pid')
  findOne(@Param('pid') pid: number) {
    return this.plansService.findOne(pid);
  }

  @Get(':pid/matches')
  findMatchByPid(@Param('pid') pid: number) {
    return this.plansService.findMatchByPid(pid);
  }

  @Delete(':pid')
  delete(@Param('pid') pid: number) {
    return this.plansService.delete(pid);
  }

  @Get(':pid/users')
  findAllUserByPid(@Param('pid') pid: number) {
    return this.plansService.findAllUserByPid(pid);
  }

  @Post(':pid/matches')
  createMatch(@Param('pid') pid: number,@Body() dto: CreateMatchDto) {
    return this.matchesService.createMatch(pid, dto);
  }
}
