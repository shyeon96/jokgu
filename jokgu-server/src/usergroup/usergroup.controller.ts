import { Controller } from '@nestjs/common';
import { UsergroupService } from './usergroup.service';

@Controller('usergroup')
export class UsergroupController {
  constructor(private readonly usergroupService: UsergroupService) {}
}
