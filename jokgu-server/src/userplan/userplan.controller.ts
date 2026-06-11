import { Controller } from '@nestjs/common';
import { UserplanService } from './userplan.service';

@Controller('userplan')
export class UserplanController {
  constructor(private readonly userplanService: UserplanService) {}
}
