import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SingUpParams } from 'src/Type/Type';
import { Users } from 'src/TypeOrm/Entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
  ) {}

  async create(user: SingUpParams): Promise<Users> {
    return await this.userRepository.save(user);
  }

  async login(condition): Promise<Users> {
    return await this.userRepository.findOne({ where: condition });
  }
}
