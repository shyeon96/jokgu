import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { DataSource } from "typeorm";

@Injectable()
export class CleanupService {
    private readonly logger = new Logger(CleanupService.name);

    constructor (
        private readonly dataSource: DataSource,
    ) {}

    @Cron('0 0 * * *')
    async deleteExpiredCodes() {
        await this.dataSource.query(`
             DELETE FROM password_reset
             WHERE expired_at < NOW()
        `);
        this.logger.log('만료된 인증코드 삭제');
    }
}