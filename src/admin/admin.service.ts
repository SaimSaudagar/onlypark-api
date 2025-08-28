import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  create(createAdminDto: any) {
    return 'This action adds a new admin';
  }

  findAll() {
    return this.adminRepository.find({ relations: ['user'] });
  }

  findOne(id: string) {
    return this.adminRepository.findOne({ where: { id }, relations: ['user'] });
  }

  update(id: string, updateAdminDto: any) {
    return `This action updates a #${id} admin`;
  }

  remove(id: string) {
    return `This action removes a #${id} admin`;
  }
}
