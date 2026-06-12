import { Controller, Get, Post, Body, HttpCode, Request, Put, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../auth/public.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePwdDto } from './dto/update-pwd.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Public()
  @Post('signup')
  @HttpCode(200)
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Get('mypage')
  mypage(@Request() req) {
    return this.usersService.mypage(req.user.id);
  }

  @Put('update')
  update(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Put('updatepwd')
  updatePwd(@Request() req, @Body() dto: UpdatePwdDto) {
    return this.usersService.updatePwd(req.user.id, dto);
  }

  @Public()
  @Get('searchemail')
  findEmailByUsername(@Query('username') username: string) {
    return this.usersService.findEmailByUsername(username);
  }

  @Public()
  @Post('sendresetcode')
  sendResetCode(@Body('email') email: string) {
    return this.usersService.sendResetCode(email);
  }
}
