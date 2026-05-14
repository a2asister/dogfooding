import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CharacterService } from './character.service';
import { Character } from '../entities/character.entity';

@Controller('api/characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  async findAll(): Promise<Character[]> {
    return this.characterService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Character | null> {
    return this.characterService.findOne(id);
  }

  @Post()
  async create(@Body() characterData: Omit<Character, 'id'>): Promise<Character> {
    return this.characterService.create(characterData);
  }
}
