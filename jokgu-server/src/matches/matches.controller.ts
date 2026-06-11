import { Controller, Get, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService
  ) {}

  @Get(':mid')
  findOne(@Param('mid') mid: number) {
    return this.matchesService.findOne(mid);
  }
}
