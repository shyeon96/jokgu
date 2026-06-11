import { Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/CreateMatchDto';
import { MatchesRepository } from './matches.repository';
import { Match, MatchOption, MatchWinner } from './entity/match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMatch } from 'src/usermatch/entity/usermatch.entity';

@Injectable()
export class MatchesService {
    constructor(
       private readonly matchesRepository: MatchesRepository,

       @InjectRepository(Match)
        private matchOrm: Repository<Match>,
       
        @InjectRepository(UserMatch)
        private userMatchOrm: Repository<UserMatch>
    ) {}

    async createMatch(pid: number, dto: CreateMatchDto) {
        const match = await this.matchOrm.create({
            plan: {id: pid},
            referee: {id: dto.referee},
            winner: dto.winner as MatchWinner,
            game: dto.game as MatchOption
        })

        const saved = await this.matchOrm.save(match);

        const victory = dto.winner === MatchWinner.A ? 1 : 0;
        const umA = dto.A.map(uid => this.userMatchOrm.create({
            match: {id: saved.id},
            user: {id: uid},
            victory: victory
        }));
        const umB = dto.B.map(uid => this.userMatchOrm.create({
            match: {id: saved.id},
            user: {id: uid},
            victory: 1 - victory
        }));

        await this.userMatchOrm.save([...umA, ...umB]);
    }

    async findOne(mid: number) {
        const result = (await this.matchesRepository.findOne(mid))[0];
        const teams = await this.matchesRepository.findAllUsersByMatch(mid);
        return {...result, teams}
    }
}
