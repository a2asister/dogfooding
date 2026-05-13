import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationInput } from '../dto/reservation.input';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find();
  }

  async findOne(id: number): Promise<Reservation | null> {
    return this.reservationRepository.findOne({ where: { id } });
  }

  async create(input: CreateReservationInput): Promise<Reservation> {
    const reservation = this.reservationRepository.create(input);
    return this.reservationRepository.save(reservation);
  }

  async updateStatus(id: number, status: string): Promise<Reservation | null> {
    await this.reservationRepository.update(id, { status });
    return this.findOne(id);
  }
}
