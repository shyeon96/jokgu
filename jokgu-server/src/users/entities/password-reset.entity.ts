import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('password_reset')
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({name:'users_id'})
    user: User;

    @Column()
    code: string;

    @Column({type: 'datetime'})
    expired_at: Date;

    @CreateDateColumn()
    created_at: Date;
}