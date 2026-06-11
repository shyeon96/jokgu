import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlansRepository } from './plans.repository';
import { CreatePlanDto } from './dto/CreatePlanDto';
import { Repository } from 'typeorm';
import { Plan } from './entity/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPlan } from 'src/userplan/entity/userplan.entity';
import { CreateMatchDto } from 'src/matches/dto/CreateMatchDto';

@Injectable()
export class PlansService {
    constructor(
        private readonly plansRepository: PlansRepository,

        @InjectRepository(Plan)
        private readonly plansOrm: Repository<Plan>,

        @InjectRepository(UserPlan)
        private readonly userplansOrm: Repository<UserPlan>,
    ) {}

    async findScheduledPlan(uid: number) {
        return this.plansRepository.findScheduledPlan(uid);
    }

    async createPlan(gid: number, dto: CreatePlanDto) {

        if (dto.uid.length <= 1) throw new BadRequestException("모임은 최소 2명이 존재해야 합니다");

        const plan = await this.plansOrm.create({
            name: dto.name,
            date: dto.date,
            start_time: dto.time,
            field: {id: dto.fid},
            group: {id: gid},
        });

        const saved = await this.plansOrm.save(plan);

        const userPlans = dto.uid.map(id =>
            this.userplansOrm.create({
                plan: {id: saved.id},
                user: {id: id}
            })
        );

        await this.userplansOrm.save(userPlans); 
    }

    async findOne(pid: number) {
        return await this.plansRepository.findOne(pid);
    }

    async findMatchByPid(pid: number) {
        const matches = await this.plansRepository.findAllMatch(pid);
        const userWR = await this.plansRepository.findAllUserWR(pid);
        return {matches, total: userWR}
    }

    async delete(pid: number) {
        const result = await this.plansOrm.delete({id: pid});
        if (result.affected === 0) {
            throw new NotFoundException('해당 일정을 찾을 수 없습니다');
        }
        return {message: "일정을 삭제하였습니다"}
    }

    async findAllUserByPid(pid: number) {
        return await this.plansRepository.findAllUserByPid(pid);
    }
}
