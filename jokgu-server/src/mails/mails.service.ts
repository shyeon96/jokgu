import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'naver',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        })
    }

    // 이메일 보내기
    async sendValidCode(to: string, code: string) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject: "비밀번호 재설정 인증코드",
            html: `<p>인증코드: <b>${code}</b></p><p>5분 이내에 입력해주세요.</p>`
        });
    }
}