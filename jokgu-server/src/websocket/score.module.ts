import { Module } from "@nestjs/common";
import { ScoreGateway } from "./score.gateway";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET
    })],
    providers: [ScoreGateway]
})

export class ScoreModule {}