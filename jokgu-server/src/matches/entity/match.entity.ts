import { Plan } from "src/plans/entity/plan.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum MatchWinner {
    A="A", B="B"
}

export enum MatchOption {
    single="single", Bo3="Bo3"
}

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Plan, (plan) => plan.matches, {nullable: false})
    @JoinColumn({name: 'plans_id'})
    plan: Plan;

    @ManyToOne(() => User, {nullable: true})
    @JoinColumn({name: 'referee_id'})
    referee: User;

    @Column({type: 'enum', enum: MatchWinner, nullable: false})
    winner: MatchWinner;

    @Column({type: 'enum', enum: MatchOption, nullable: false})
    game: MatchOption;

    @CreateDateColumn()
    created_at: Date;
}