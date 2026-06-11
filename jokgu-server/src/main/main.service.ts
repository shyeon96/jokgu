import { Injectable } from "@nestjs/common";
import { MainRepository } from "./main.repository";

@Injectable()
export class MainService {
    constructor(private readonly mainRepository: MainRepository) {}

    async findAllTodayPlan(uid: number) {
        return this.mainRepository.findAllTodayPlan(uid);
    }

    async findAllGroupByRole(uid: number) {
        return this.mainRepository.findAllGroupByRole(uid);
    }
}