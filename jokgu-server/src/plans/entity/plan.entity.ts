import { Field } from "src/fields/entity/field.entity";
import { Group } from "src/groups/entity/group.entity";
import { Match } from "src/matches/entity/match.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Group, (group) => group.plans, { nullable: false})
    @JoinColumn({name: 'groups_id'})
    group: Group;

    @ManyToOne(() => Field, (field) => field.plans, {nullable: false})
    @JoinColumn({name: 'fields_id'})
    field: Field;

    @Column({nullable: false})
    name: string;

    @Column({type: 'date', nullable: false})
    date: string;

    @Column({type: 'time', nullable:false})
    start_time: string;

    @OneToMany(() => Match, (match) => match.plan, {nullable: false})
    matches: Match[];
}