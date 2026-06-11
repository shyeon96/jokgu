import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class MatchesRepository {
    constructor(private dataSource: DataSource) {}

    async findOne(mid: number) {
        return this.dataSource.query(`
            SELECT m.winner AS winner, m.game AS game, m.created_at AS created_at, u.name AS referee
            FROM matches m
            LEFT JOIN users u ON m.referee_id = u.id
            WHERE m.id = ?
        `, [mid])
    }

    async findAllUsersByMatch(mid: number) {
        return this.dataSource.query(`
            SELECT um.victory AS victory, u.id AS uid, u.name AS name
            FROM usermatch um
            LEFT JOIN users u ON um.users_id = u.id
            WHERE um.matches_id = ?
        `, [mid])
    }
}