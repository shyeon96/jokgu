import { Plan } from "src/plans/entity/plan.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('fields')
export class Field {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({nullable: false})
    address: string;

    @Column('decimal', {precision: 10, scale: 7})
    lat: number;

    @Column('decimal', {precision: 10, scale: 7})
    lng: number;

    @Column( {default: 0} )
    cost: string = '0';

    @Column()
    url: string;

    @Column( {nullable: false, default: 0})
    is_indoor: number;

    @Column( {nullable: false, default: 0})
    is_reservable: number;

    @Column( {nullable: false, default: 0})
    is_parking: number;

    @OneToMany(() => Plan, (plan) => plan.field)
    plans: Plan[];
}