import { Group } from "src/groups/entity/group.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    admin = "admin", member = "member", pending = "pending"
}

@Entity('usergroup')
export class UserGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userGroup)
    @JoinColumn({name: 'users_id'})
    user: User;

    @ManyToOne(() => Group)
    @JoinColumn({name: 'groups_id'})
    group: Group;

    @Column({type:'enum', enum:Role, default:'pending'})
    role: Role;
}