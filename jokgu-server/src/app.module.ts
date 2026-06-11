import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { PlansModule } from './plans/plans.module';
import { MatchesModule } from './matches/matches.module';
import { FieldsModule } from './fields/fields.module';
import { UsergroupModule } from './usergroup/usergroup.module';
import { UserplanModule } from './userplan/userplan.module';
import { UsermatchModule } from './usermatch/usermatch.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt.guard';
import { MainModule } from './main/main.module';
import { ScoreModule } from './websocket/score.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get("DB_HOST"),
        port: config.get<number>('DB_PORT'),
        username: config.get("DB_USERNAME"),
        password: config.get('DB_PASSWORD'),
        database: config.get("DB_DATABASE"),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        timezone: '+09:00'
      })
    }),
    MainModule,
    UsersModule,
    GroupsModule,
    PlansModule,
    MatchesModule,
    FieldsModule,
    UsergroupModule,
    UserplanModule,
    UsermatchModule,
    ScoreModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ],
})
export class AppModule { }
