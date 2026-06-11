import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,

    @InjectRepository(User)
    private readonly userOrm: Repository<User>
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 검증
    const { username, password, name } = createUserDto;

    if (!username || !password || !name) {
      throw new BadRequestException("필수 항목을 입력해주세요");
    }

    const existing = await this.userOrm.findOne({where: {username}});
    if (existing) throw new ConflictException("이미 사용중인 아이디입니다");

    try {
      const hashed = await bcrypt.hash(createUserDto.password, 10);
      const user = this.userOrm.create({
        ...createUserDto,
        password: hashed
      });

      await this.userOrm.save(user);
      return { message: "회원가입이 완료되었습니다"};

    } catch (e) {
      throw new InternalServerErrorException("서버 오류가 발생했습니다");
    }
    
  }

  async login (loginDto: LoginDto) {
    try {
      const { username, password } = loginDto;
      // 입력값 검증
      if (!username || !password) {
        throw new BadRequestException('아이디와 비밀번호를 입력해주세요');
      }

      // 해당 username으로 저장된 password 가져오기
      const user = await this.userOrm.findOne({where: {username}});
      if (!user) throw new UnauthorizedException('아이디 또는 비밀번호가 틀렸습니다');
      if(!user.is_active) throw new NotFoundException('해당 유저는 비활성화 상태입니다');

      // 입력받은 password와 검증
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException("아이디 또는 비밀번호가 틀렸습니다");

      // jwt 토큰 발급
      const payload = { id: user.id, username: user.username };
      const token = this.jwtService.sign(payload);
      const name = user.name;
    
      // 토큰값 return
      return { token, user: name };
    } catch (e) {
      if (e instanceof BadRequestException || 
        e instanceof UnauthorizedException || 
        e instanceof NotFoundException) {
      throw e;
      }
      throw new InternalServerErrorException("서버 오류가 발생했습니다");
    }
  }

  async mypage(uid: number) {
    try {
      const user = await this.usersRepository.findOne(uid);
      const myplans = await this.usersRepository.findAllPlanByUser(uid);
      const winrate = await this.usersRepository.findWinrateByUser(uid);
      const joinRatio = await this.usersRepository.joinRatio(uid);
      return {...user, myplans, winrate, groupRatio: joinRatio}
    } catch (e) {
      throw new InternalServerErrorException("서버 오류가 발생했습니다");
    }
  }
  async update(uid: number, dto: UpdateUserDto) {
    try {
      await this.userOrm.update(uid, dto);
      return {message: "수정 완료"};
    } catch (e) {
      throw new BadRequestException("에러가 발생했습니다");
    }
}}
