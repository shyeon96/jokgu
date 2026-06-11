import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateGroupDto } from "./dto/CreateGroupDto";

@Injectable()
export class GroupRepository {
    constructor(private dataSource: DataSource) {}

    findAllByUser(uid: number) {
        return this.dataSource.query(`
            SELECT g.id AS gid, g.name AS gname, g.invite_code AS gcode, ug.role AS ugrole, COUNT(ug2.users_id) AS count
            FROM \`groups\` g
            JOIN usergroup ug ON g.id = ug.groups_id
            JOIN usergroup ug2 ON g.id = ug2.groups_id AND ug2.role IN ('member', 'admin')
            WHERE ug.users_id = ? AND ug.role IN ('member','admin')
            GROUP BY g.id, ug.role;
        `, [uid])
    }

    async createGroup(uid: number, dto: CreateGroupDto, inviteCode: string) {
        const result = await this.dataSource.query(`
            INSERT INTO \`groups\` (name, description, invite_code)
                VALUES (?, ?, ?)
        `, [dto.name, dto.description, inviteCode])

        await this.dataSource.query(`
            INSERT INTO usergroup (users_id, groups_id, role)
            VALUES (?, ?, 'admin')
        `, [uid, result.insertId])

        return {id: result.insertId};
    }

    async joinRequest(uid: number, gid: number) {
        return await this.dataSource.query(`
            INSERT INTO usergroup (users_id ,groups_id, role)
            VALUES (?, ?, 'pending')
        `, [uid, gid])
    }

    async findOneByUser(uid: number, gid: number) {
        return await this.dataSource.query(`
            SELECT g.name AS name, g.description AS description, ug.role AS role, g.invite_code AS code
            FROM \`groups\` g
            JOIN usergroup ug ON g.id = ug.groups_id
            WHERE ug.users_id = ? AND g.id = ?
        `, [uid, gid])
    }

    async findAllUserByGid(gid: number) {
        return await this.dataSource.query(`
            SELECT u.id AS uid, u.name AS name, ug.role AS role
            FROM usergroup ug
            JOIN users u ON ug.users_id = u.id
            WHERE ug.groups_id = ? AND ug.role IN ("member", "admin") AND u.is_active = 1
        `, [gid])
    }

    async findAllPlanByGid(gid: number) {
        return await this.dataSource.query(`
            SELECT p.id AS pid, p.date AS date, f.name AS name, p.name AS planname
            FROM plans p
            JOIN fields f ON p.fields_id = f.id
            WHERE p.groups_id = ?
            ORDER BY p.date DESC, p.start_time DESC
        `, [gid])
    }
}