import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createDto: any): Promise<Booking> {
    const entity = this.bookingRepository.create(createDto);
    const savedEntity = await this.bookingRepository.save(entity);
    return savedEntity as unknown as Booking;
  }

  async findAll(options?: FindManyOptions<Booking>): Promise<Booking[]> {
    return await this.bookingRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Booking>): Promise<Booking> {
    return await this.bookingRepository.findOne(options);
  }

  async update(id: string, updateDto: any) {
    const entity = await this.bookingRepository.findOne({ where: { id } });
    if (entity) {
      Object.assign(entity, updateDto);
      return await this.bookingRepository.save(entity);
    }
    return null;
  }

  remove(id: string) {
    return `This action removes a #${id} booking`;
  }
}

