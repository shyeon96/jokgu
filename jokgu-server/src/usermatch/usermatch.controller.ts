import { Controller } from '@nestjs/common';
import { UsermatchService } from './usermatch.service';

@Controller('usermatch')
export class UsermatchController {
  constructor(private readonly usermatchService: UsermatchService) {}
}
