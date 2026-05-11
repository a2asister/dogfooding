import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CharacterService } from './character.service';
import { Character } from './character.entity';

@Controller('api/characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  findAll(): Promise<Character[]> {
    return this.characterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Character | null> {
    return this.characterService.findById(id);
  }

  @Post()
  create(@Body() character: Partial<Character>): Promise<Character> {
    return this.characterService.create(character);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() character: Partial<Character>,
  ): Promise<Character> {
    return this.characterService.update(id, character);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.characterService.remove(id);
  }
}
