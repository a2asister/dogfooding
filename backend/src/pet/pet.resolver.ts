import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PetService } from './pet.service';
import { Pet } from './pet.entity';
import { PetPhoto } from './pet-photo.entity';
import { GrowthRecord } from './growth-record.entity';
import { CreatePetInput, UpdatePetInput } from './dto/create-pet.input';
import { CreatePhotoInput } from './dto/create-photo.input';
import { CreateGrowthRecordInput } from './dto/create-growth-record.input';

@Resolver(() => Pet)
export class PetResolver {
  constructor(private readonly petService: PetService) {}

  @Query(() => [Pet], { name: 'pets' })
  findAll() {
    return this.petService.findAll();
  }

  @Query(() => Pet, { name: 'pet' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.petService.findOne(id);
  }

  @Mutation(() => Pet)
  createPet(@Args('createPetInput') createPetInput: CreatePetInput) {
    return this.petService.create(createPetInput);
  }

  @Mutation(() => Pet)
  updatePet(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePetInput') updatePetInput: UpdatePetInput,
  ) {
    return this.petService.update(id, updatePetInput);
  }

  @Mutation(() => Boolean)
  deletePet(@Args('id', { type: () => Int }) id: number) {
    return this.petService.remove(id);
  }

  @Mutation(() => PetPhoto)
  addPhoto(@Args('createPhotoInput') createPhotoInput: CreatePhotoInput) {
    return this.petService.addPhoto(createPhotoInput);
  }

  @Query(() => [PetPhoto], { name: 'petPhotos' })
  getPhotosByPetId(@Args('petId', { type: () => Int }) petId: number) {
    return this.petService.getPhotosByPetId(petId);
  }

  @Mutation(() => GrowthRecord)
  addGrowthRecord(@Args('createGrowthRecordInput') createGrowthRecordInput: CreateGrowthRecordInput) {
    return this.petService.addGrowthRecord(createGrowthRecordInput);
  }

  @Query(() => [GrowthRecord], { name: 'growthRecords' })
  getGrowthRecordsByPetId(@Args('petId', { type: () => Int }) petId: number) {
    return this.petService.getGrowthRecordsByPetId(petId);
  }
}
