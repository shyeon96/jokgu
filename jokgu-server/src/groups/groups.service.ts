import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GroupRepository } from './groups.repository';
import { CreateGroupDto } from './dto/CreateGroupDto';
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Repository } from 'typeorm';
import { Role, UserGroup } from 'src/usergroup/entity/usergroup.entity';

@Injectable()
export class GroupsService {
    constructor(
        private groupRepository: GroupRepository,

        @InjectRepository(Group)
        private groupOrm: Repository<Group>,

        @InjectRepository(UserGroup)
        private userGroupOrm: Repository<UserGroup>
    ) {}

    async findAllByUser (uid: number) {      
        return this.groupRepository.findAllByUser(uid);
    }

    async createGroup(uid: number, dto: CreateGroupDto) {
        const { name, description } = dto;
        if ( !name || !description ) throw new BadRequestException('필수 항목을 입력해주세요');
        let inviteCode: string;


        while (true) {
            inviteCode = v4().replace(/-/g, '').substring(0, 8).toUpperCase();
            const exist = await this.groupOrm.findOne({where: {invite_code: inviteCode}});
            if (!exist) break;
        }

        const result = await this.groupRepository.createGroup(uid, dto, inviteCode);
        return {message: "모임을 생성하였습니다", ...result}
    }

    async findByCode(uid: number, code: string) {
        const result = await this.groupOrm.findOne({where: {invite_code: code}});
        if (!result) throw new NotFoundException('존재하지 않는 초대코드입니다');

        const member = await this.userGroupOrm.findOne({
            where: {group: {id: result.id}, user: {id: uid}}
        })

        return {gid: result.id, name: result.name, isJoin: !!member};
    }

    async joinRequest(uid: number, gid: number) {
        const result = await this.groupRepository.joinRequest(uid, gid);
        if (result.affectedRows === 0) throw new BadRequestException("가입 요청에 실패했습니다");
        return {message: "가입 요청이 완료되었습니다"};
    }

    async findOne(uid: number, gid: number) {
        return await this.groupRepository.findOneByUser(uid, gid);
    }

    async getPending(gid: number) {
        const result =  await this.userGroupOrm.find({
            where: {group: {id: gid}, role: Role.pending},
            relations: {user: true, group:true}
        })        
        return result.map(ug => ({
            ugid: ug.id,
            uid: ug.user.id,
            name:ug.user.name
        }))
    }

    async getUserList(gid: number) {
        return await this.groupRepository.findAllUserByGid(gid);
    }

    async getPlanList(gid: number) {
        return await this.groupRepository.findAllPlanByGid(gid);
    }

    async approve(approve: number, ugid: number) {
        if (approve === 0) {
            return await this.userGroupOrm.delete({id: ugid})
        } else if (approve === 1) {
            return await this.userGroupOrm.update({id: ugid}, {role: Role.member});
        } else {
            throw new BadRequestException("에러가 발생했습니다")
        }
    }
    
    async update(gid: number, name: string, description: string) {
        if (!name) throw new BadRequestException("제목은 필수입니다");
        await this.groupOrm.update({id: gid}, {name, description})
    }

    async leave(uid: number, gid: number) {
        await this.userGroupOrm.delete({user: {id: uid}, group: {id: gid}})
    }

}
