import { UserGroup } from "src/usergroup/entity/usergroup.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    username: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({nullable: true})
    address: string;

    @Column({nullable: true})
    account: string;

    @Column({nullable: true})
    phone: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    is_active: number

    @OneToMany(() => UserGroup, (usergroup) => usergroup.user)
    userGroup: UserGroup[]
}
