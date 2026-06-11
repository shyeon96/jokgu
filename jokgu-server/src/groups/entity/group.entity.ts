import { Plan } from "src/plans/entity/plan.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('groups')
export class Group {

    @PrimaryGeneratedColumn()
    id: number;
    @Column({nullable: false})
    name: string;
    @Column({nullable:false})
    invite_code: string;
    @Column()
    description: string;
    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Plan, (plan) => plan.group)
    plans: Plan[];
}