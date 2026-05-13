import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { PetPhoto } from './pet-photo.entity';
import { GrowthRecord } from './growth-record.entity';
import { CreatePetInput, UpdatePetInput } from './dto/create-pet.input';
import { CreatePhotoInput } from './dto/create-photo.input';
import { CreateGrowthRecordInput } from './dto/create-growth-record.input';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private petRepository: Repository<Pet>,
    @InjectRepository(PetPhoto) private photoRepository: Repository<PetPhoto>,
    @InjectRepository(GrowthRecord) private growthRecordRepository: Repository<GrowthRecord>,
  ) {}

  async findAll(): Promise<Pet[]> {
    return this.petRepository.find({ relations: ['photos', 'growthRecords'] });
  }

  async findOne(id: number): Promise<Pet> {
    const pet = await this.petRepository.findOne({
      where: { id },
      relations: ['photos', 'growthRecords'],
    });
    if (!pet) {
      throw new NotFoundException(`宠物 #${id} 未找到`);
    }
    return pet;
  }

  async create(createPetInput: CreatePetInput): Promise<Pet> {
    const pet = this.petRepository.create(createPetInput);
    return this.petRepository.save(pet);
  }

  async update(id: number, updatePetInput: UpdatePetInput): Promise<Pet> {
    const pet = await this.findOne(id);
    Object.assign(pet, updatePetInput);
    return this.petRepository.save(pet);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.petRepository.delete(id);
    return result.affected > 0;
  }

  async addPhoto(createPhotoInput: CreatePhotoInput): Promise<PetPhoto> {
    const pet = await this.findOne(createPhotoInput.petId);
    const photo = this.photoRepository.create({
      ...createPhotoInput,
      pet,
    });
    return this.photoRepository.save(photo);
  }

  async getPhotosByPetId(petId: number): Promise<PetPhoto[]> {
    return this.photoRepository.find({ where: { pet: { id: petId } } });
  }

  async addGrowthRecord(createGrowthRecordInput: CreateGrowthRecordInput): Promise<GrowthRecord> {
    const pet = await this.findOne(createGrowthRecordInput.petId);
    const record = this.growthRecordRepository.create({
      ...createGrowthRecordInput,
      pet,
    });
    return this.growthRecordRepository.save(record);
  }

  async getGrowthRecordsByPetId(petId: number): Promise<GrowthRecord[]> {
    return this.growthRecordRepository.find({ where: { pet: { id: petId } }, order: { date: 'ASC' } });
  }
}
