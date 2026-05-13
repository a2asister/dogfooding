import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { TripNode } from './entities/trip-node.entity';
import { CreateTripInput } from './dto/create-trip.dto';
import { CreateTripNodeInput } from './dto/create-trip-node.dto';
import { UpdateTripInput } from './dto/update-trip.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(TripNode)
    private tripNodeRepository: Repository<TripNode>,
  ) {}

  async create(createTripInput: CreateTripInput): Promise<Trip> {
    const trip = this.tripRepository.create(createTripInput);
    return this.tripRepository.save(trip);
  }

  async createNode(createTripNodeInput: CreateTripNodeInput): Promise<TripNode> {
    const node = this.tripNodeRepository.create(createTripNodeInput);
    return this.tripNodeRepository.save(node);
  }

  async findAll(category?: string, isArchived?: boolean): Promise<Trip[]> {
    const query = this.tripRepository.createQueryBuilder('trip').leftJoinAndSelect('trip.nodes', 'nodes').orderBy('nodes.order', 'ASC');

    if (category) {
      query.andWhere('trip.category = :category', { category });
    }

    if (isArchived !== undefined) {
      query.andWhere('trip.isArchived = :isArchived', { isArchived });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['nodes'],
    });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    return trip;
  }

  async update(id: number, updateTripInput: UpdateTripInput): Promise<Trip> {
    const trip = await this.findOne(id);
    Object.assign(trip, updateTripInput);
    return this.tripRepository.save(trip);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.tripRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async removeNode(id: number): Promise<boolean> {
    const result = await this.tripNodeRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getCategories(): Promise<string[]> {
    const trips = await this.tripRepository.createQueryBuilder('trip').select('DISTINCT trip.category', 'category').getRawMany<{ category: string }>();
    return trips.map((t) => t.category);
  }
}