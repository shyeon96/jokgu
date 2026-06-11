import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/CreateFieldDto';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Get()
  findAll() {
    return this.fieldsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateFieldDto) {
    return this.fieldsService.create(dto);
  }

  @Get(':fid')
  findOne(@Param('fid') fid: number) {
    return this.fieldsService.findOne(fid);
  }

  @Get(':fid/planinfo')
  findPlansByFid(@Request() req, @Param('fid') fid: number) {
    return this.fieldsService.findPlansByFid(req.user.id, fid);
  }
}
