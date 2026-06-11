import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/CreateGroupDto';
import { CreatePlanDto } from 'src/plans/dto/CreatePlanDto';
import { PlansService } from 'src/plans/plans.service';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly plansService: PlansService
  ) {}

  @Get()
  findAllByUser(@Request() req) {
    return this.groupsService.findAllByUser(req.user.id);
  }

  @Post('create')
  createGroup(@Request() req, @Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(req.user.id, dto);
  }

  @Get('join')
  findByCode(@Request() req, @Query('code') code: string) {
    return this.groupsService.findByCode(req.user.id, code);
  }

  @Post('join')
  joinRequest(@Request() req, @Body('gid') gid: number) {
    return this.groupsService.joinRequest(req.user.id, gid);
  }

  @Get(':gid')
  findOne(@Request() req, @Param('gid') gid: number) {
    return this.groupsService.findOne(req.user.id, gid);
  }

  @Get(':gid/pending')
  getPending(@Param('gid') gid: number) {    
    return this.groupsService.getPending(gid);
  }

  @Get(':gid/userlist')
  findUsersByGid(@Param('gid') gid: number) {
    return this.groupsService.getUserList(gid);
  }

  @Get(':gid/planlist')
  findPlansByGid(@Param('gid') gid: number) {
    return this.groupsService.getPlanList(gid);
  }

  @Put(':gid/approve')
  approve(@Body() body: {approve: number, ugid: number }) {
    return this.groupsService.approve(body.approve, body.ugid);
  }

  @Put(':gid/update')
  update(@Param(`gid`) gid: number, @Body() body: { name: string, description: string }) {
    return this.groupsService.update(gid, body.name, body.description)
  }

  @Delete(':gid/leave')
  leave(@Request() req, @Param('gid') gid: number) {
    return this.groupsService.leave(req.user.id, gid);
  }

  @Post(':gid/create')
  createPlan(@Param('gid') gid: number, @Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(gid, dto);
  }
}
