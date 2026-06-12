import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { MailModule } from 'src/mails/mails.module';
import { PasswordReset } from './entities/password-reset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordReset]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }
      })
    }),
    MailModule
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, UsersRepository],
  exports: [JwtModule]
})
export class UsersModule { }
