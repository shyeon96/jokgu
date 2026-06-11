import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchesRepository } from './matches.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMatch } from 'src/usermatch/entity/usermatch.entity';
import { Match } from './entity/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, UserMatch])],
  controllers: [MatchesController],
  providers: [MatchesService, MatchesRepository],
  exports: [MatchesService]
})
export class MatchesModule {}
