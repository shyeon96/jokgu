import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class UsersRepository {
    constructor(private readonly dataSource: DataSource) {}
    

    async findOne(uid: number) {
        const [result] = await this.dataSource.query(`
            SELECT id AS uid, name, address, account, phone
            FROM users
            WHERE id = ?
        `, [uid])

        return result;
    }

    async findAllPlanByUser(uid: number) {
        return await this.dataSource.query(`
            SELECT p.id AS pid, p.name AS planname, p.date AS date, p.start_time AS time, g.name AS groupname
            FROM userplan up
            JOIN plans p ON up.plans_id = p.id
            JOIN \`groups\` g ON p.groups_id = g.id
            WHERE up.users_id = ? AND p.date < CURDATE()
            ORDER BY p.date DESC, p.start_time DESC
        `, [uid])
    }

    async findWinrateByUser(uid: number) {
        return await this.dataSource.query(`
            SELECT
                g.id AS gid,
                g.name AS gname,
                SUM(CASE WHEN um.victory = 1 THEN 1 ELSE 0 END) AS win,
                SUM(CASE WHEN um.victory = 0 THEN 1 ELSE 0 END) AS lose
            FROM usergroup ug
            JOIN \`groups\` g ON ug.groups_id = g.id
            JOIN plans p ON p.groups_id = g.id
            JOIN matches m ON m.plans_id = p.id
            JOIN usermatch um ON um.matches_id = m.id
            WHERE ug.users_id = ?
            AND um.users_id = ?
            GROUP BY g.id, g.name
        `, [uid, uid])
    }

    async joinRatio(uid: number) {
        return await this.dataSource.query(`
            SELECT g.id AS gid, g.name AS gname, COUNT(up.plans_id) AS count, SUM(COUNT(up.plans_id)) OVER () AS totalCount
            FROM userplan up
            JOIN plans p ON up.plans_id = p.id
            JOIN \`groups\` g ON p.groups_id = g.id
            JOIN users u ON up.users_id = u.id
            WHERE u.id = ? AND p.date < CURDATE()
            GROUP BY g.id, g.name
            ORDER BY count DESC
            LIMIT 4    
        `, [uid])
    }
}