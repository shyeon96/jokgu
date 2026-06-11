import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class MainRepository {
    constructor(private readonly dataSource: DataSource) {}

    async findAllTodayPlan(uid: number) {
        return this.dataSource.query(`
            SELECT p.id AS pid, p.name AS planname, f.name AS field, p.start_time AS time, f.address AS address
            FROM plans p
            JOIN fields f ON p.fields_id = f.id
            JOIN userplan up ON p.id = up.plans_id
            WHERE up.users_id = ? AND DATE(p.date) = CURDATE()
        `, [uid])
    }

    async findAllGroupByRole(uid: number) {
        return this.dataSource.query(`
            SELECT g.id AS gid, g.name AS groupname, g.invite_code AS code
            FROM \`groups\` g
            JOIN usergroup ug ON g.id = ug.groups_id
            WHERE ug.users_id = ? AND ug.role = 'admin'
        `, [uid])
    }
}