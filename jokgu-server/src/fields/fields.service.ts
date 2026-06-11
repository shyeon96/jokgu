import { BadRequestException, Injectable } from '@nestjs/common';
import { FieldsRepository } from './fields.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Field } from './entity/field.entity';
import { Repository } from 'typeorm';
import { CreateFieldDto } from './dto/CreateFieldDto';
import axios from 'axios';

@Injectable()
export class FieldsService {
    constructor(
        private readonly fieldsRepository: FieldsRepository,

        @InjectRepository(Field)
        private readonly fieldOrm: Repository<Field>,
    ) {}

    async findAll() {
        return this.fieldsRepository.findAll();
    }

    async create(dto: CreateFieldDto) {

        if (dto.address) {
            const response = await axios.get('https://maps.apigw.ntruss.com/map-geocode/v2/geocode',
                {
                    params: {query: dto.address},
                    headers: {
                        "x-ncp-apigw-api-key-id": process.env.NAVER_CLIENT_ID,
                        "x-ncp-apigw-api-key" : process.env.NAVER_CLIENT_KEY
                    }
                }
            );
            const {x, y} = response.data.addresses[0];
            const field = this.fieldOrm.create({
                ...dto,
                lng: parseFloat(x),
                lat: parseFloat(y)
            });

            return this.fieldOrm.save(field);
        }
    }

    async findOne(fid: number) {
        return await this.fieldOrm.findOne({where: {id: fid}});
    }

    async findPlansByFid(uid: number, fid: number) {
        const count = await this.fieldsRepository.countPlanTimes(fid);
        const result = await this.fieldsRepository.findPlansByFid(uid, fid);
        return {count, plans: result}
    }
}
