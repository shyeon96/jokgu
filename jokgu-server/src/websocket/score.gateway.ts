import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as dotenv from 'dotenv';
import { JwtService } from "@nestjs/jwt";
dotenv.config();

interface ScoreData {
    aScore: number;
    bScore: number;
    aSetScore: number;
    bSetScore: number;
}

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN } })
export class ScoreGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor( private readonly jwtService: JwtService ) {}
    private scoreCache = new Map<string, any>();

    handleConnection(client: Socket) {
        console.log(`connected: ${client.id}`);
        const token = client.handshake.auth?.token;
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            this.jwtService.verify(token);
        } catch (e) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(@MessageBody() pid: string, @ConnectedSocket() client: Socket) {

        client.rooms.forEach((room) => {
            if (room !== client.id) {
                client.leave(room);
            }
        });

        client.join(pid);

        if (this.scoreCache.has(pid)) {
            client.emit('nowScore', this.scoreCache.get(pid))
        }
    }

    @SubscribeMessage('updateScore')
    handleScore(@ConnectedSocket() client: Socket, @MessageBody() data: {pid: string, score: ScoreData}) {
        this.scoreCache.set(data.pid, data.score);
        this.server.to(data.pid).emit('nowScore', data.score);
    }

    @SubscribeMessage("leave")
    handleLeave(@ConnectedSocket() client: Socket, @MessageBody() pid) {
        client.leave(pid);
    }

    @SubscribeMessage("matchEnd")
    handleMatchEnd(@MessageBody() pid: string) {
        this.scoreCache.delete(pid);
        this.server.to(pid).emit('matchEnd');
    }

}