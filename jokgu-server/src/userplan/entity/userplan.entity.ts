import { Plan } from "src/plans/entity/plan.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('userplan')
export class UserPlan {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({name: 'users_id'})
    user: User;

    @ManyToOne(() => Plan)
    @JoinColumn({name: 'plans_id'})
    plan: Plan;
}