import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class FieldsRepository {
    constructor(private dataSource: DataSource) { }

    async findAll() {
        return await this.dataSource.query(`
            SELECT id, name, cost, is_indoor AS isIn, is_reservable AS isRes
            FROM fields
        `)
    }

    async countPlanTimes(fid: number) {
        return await this.dataSource.query(`
            SELECT COUNT(*) AS count
            FROM plans
            WHERE fields_id = ?
            AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        `, [fid])
    }

    async findPlansByFid(uid: number, fid: number) {
        return await this.dataSource.query(`
            SELECT DISTINCT p.id AS pid, p.name AS planname, g.name AS groupname, p.date AS date, p.start_time AS time
            FROM plans p
            JOIN userplan up ON up.plans_id = p.id
            JOIN \`groups\` g ON p.groups_id = g.id
            WHERE p.fields_id = ?
            AND up.users_id = ?
            ORDER BY p.date DESC
            LIMIT 5
        `, [fid, uid])
    }
}