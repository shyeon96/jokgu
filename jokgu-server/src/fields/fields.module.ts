import { Module } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import { FieldsRepository } from './fields.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './entity/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Field])],
  controllers: [FieldsController],
  providers: [FieldsService, FieldsRepository],
})
export class FieldsModule {}
