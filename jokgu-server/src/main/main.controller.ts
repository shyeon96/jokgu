import { Controller, Get, Request } from "@nestjs/common";
import { MainService } from "./main.service";

@Controller('main')
export class MainController {
    constructor(private readonly mainService: MainService) {}

    @Get('today')
    findAllTodayPlan(@Request() req) {
        return this.mainService.findAllTodayPlan(req.user.id);
    }

    @Get('manage')
    findAllGroupByRole(@Request() req) {
        return this.mainService.findAllGroupByRole(req.user.id);
    }
}