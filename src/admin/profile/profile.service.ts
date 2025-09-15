import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { AdminStatus } from '../../common/enums';
import { CustomException } from '../../common/exceptions/custom.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { CreateProfileDto, UpdateProfileDto} from './profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ) { }

    async create(request: CreateProfileDto) {
        const adminInDb = await this.adminRepository.findOne({ where: { userId: request.userId } });

        if (adminInDb) {
            throw new CustomException(
                ErrorCode.ADMIN_ALREADY_EXISTS.key,
                HttpStatus.BAD_REQUEST,
            );
        }

        const savedAdmin = await this.adminRepository.save({
            userId: request.userId,
            status: AdminStatus.ACTIVE,
        });
        return savedAdmin;
    }

    findAll() {
        return this.adminRepository.find({ relations: ['user'] });
    }

    findOne(id: string) {
        return this.adminRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async update(id: string, updateProfileDto: UpdateProfileDto) {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) {
            throw new Error(`Admin with ID ${id} not found`);
        }

        Object.assign(admin, updateProfileDto);
        return await this.adminRepository.save(admin);
    }

    async remove(id: string) {
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) {
            throw new Error(`Admin with ID ${id} not found`);
        }

        return await this.adminRepository.remove(admin);
    }
}
