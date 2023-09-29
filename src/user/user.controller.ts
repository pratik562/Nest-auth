import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { singInDto, singUpDto } from 'src/dtos/dtos';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('users')
export class UserController {
  constructor(
    private readonly userServices: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('/singUp')
  async signUp(@Body() userDetails: singUpDto) {
    const hashedPassword = await bcrypt.hash(userDetails.password, 12);
    const user = await this.userServices.create({
      name: userDetails.name,
      email: userDetails.email,
      password: hashedPassword,
    });

    delete user.password;

    return user;
  }

  @Post('/singIn')
  async signIn(
    @Body() userdetail: singInDto,
    @Res({ passthrough: true }) responce: Response,
  ) {
    const user = await this.userServices.login({ email: userdetail.email });

    if (!user) {
      throw new HttpException('Invalid Credential', HttpStatus.BAD_REQUEST);
    } else if (!(await bcrypt.compare(userdetail.password, user.password))) {
      throw new HttpException('Invalid Password', HttpStatus.BAD_REQUEST);
    }
    const jwt = await this.jwtService.signAsync({ id: user.id });
    const abc = responce.cookie('jwt', jwt, {
      httpOnly: true,
      sameSite: 'strict',
    });
    console.log('abc', abc);

    return {
      msg: 'LogIn success',
    };
  }

  @Get('/users')
  async getUser(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];

      const users = await this.jwtService.verifyAsync(cookie);
      if (!users) throw new UnauthorizedException();

      const findUser = await this.userServices.login({ id: users['id '] });

      const { password, ...result } = findUser;

      return result;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) responce: Response) {
    responce.clearCookie('jwt');

    return {
      massage: 'Logout success',
    };
  }
}
