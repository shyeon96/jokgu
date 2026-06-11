import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class PlansRepository {
    constructor(private dataSource: DataSource) {}

    async findScheduledPlan(uid: number) {
        const result = await this.dataSource.query(`
            SELECT
                p.id AS pid,
                p.name AS planname,
                f.name AS fieldname,
                p.date AS date,
                p.start_time AS time,
                COUNT(up.users_id) AS count,
                g.name AS groupname
            FROM plans p
            JOIN fields f ON p.fields_id = f.id
            JOIN \`groups\` g ON p.groups_id = g.id
            JOIN userplan up ON p.id = up.plans_id
            WHERE p.date >= CURDATE()
            AND p.id IN (
                SELECT plans_id
                FROM userplan
                WHERE users_id = ?
            )
            GROUP BY p.id, p.name, f.name, p.date, p.start_time, g.name
            ORDER BY p.date ASC, p.start_time ASC
        `, [uid])
        return result;
    }

    async findOne(pid: number) {
        const [result] = await this.dataSource.query(`
            SELECT
            p.name AS planname,
            f.name AS fieldname,
            f.address AS address,
            f.lat AS lat,
            f.lng AS lng,
            p.date AS date,
            p.start_time AS time,
            g.name AS groupname
            FROM plans p
            JOIN fields f ON p.fields_id = f.id
            JOIN \`groups\` g ON p.groups_id = g.id
            WHERE p.id = ?
        `, [pid])

        return result;
    }

    async findAllMatch(pid: number) {
        return await this.dataSource.query(`
            SELECT m.id AS mid, m.winner AS winner, m.game AS game
            FROM matches m
            WHERE m.plans_id = ?
        `, [pid])
    }

    async findAllUserWR(pid: number) {
        return await this.dataSource.query(`
            SELECT
                u.id AS uid,
                u.name AS name,
                SUM(CASE WHEN um.victory = 1 THEN 1 ELSE 0 END) AS win,
                SUM(CASE WHEN um.victory = 0 THEN 1 ELSE 0 END) AS lose,
                SUM(CASE WHEN um.victory = 0 THEN (CASE WHEN m.game = 'single' THEN 500 ELSE 1000 END) ELSE 0 END) AS price
            FROM userplan up
            JOIN users u ON up.users_id = u.id
            LEFT JOIN (
                SELECT um.*
                FROM usermatch um
                JOIN matches m ON um.matches_id = m.id
                WHERE m.plans_id = ?
            ) um ON um.users_id = u.id
            LEFT JOIN matches m ON um.matches_id = m.id
            WHERE up.plans_id = ?
            GROUP BY u.id, u.name
        `, [pid, pid])
    }

    async findAllUserByPid(pid: number) {
        return await this.dataSource.query(`
            SELECT u.id AS uid, u.name AS name
            FROM userplan up
            JOIN users u ON up.users_id = u.id
            WHERE up.plans_id = ?
        `, [pid])
    }
}