import { Module } from "@nestjs/common";
import { ScoreGateway } from "./score.gateway";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [JwtModule],
    providers: [ScoreGateway]
})

export class ScoreModule {}