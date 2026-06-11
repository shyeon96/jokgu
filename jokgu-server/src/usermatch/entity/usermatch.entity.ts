import { Match } from "src/matches/entity/match.entity";
import { Plan } from "src/plans/entity/plan.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usermatch')
export class UserMatch {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({name: 'users_id'})
    user: User;

    @ManyToOne(() => Match)
    @JoinColumn({name: 'matches_id'})
    match: Match;

    @Column()
    victory: number;
}