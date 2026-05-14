import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ElementService } from './element.service';
import { CreateElementDto } from './dto/create-element.dto';
import { UpdateElementDto } from './dto/update-element.dto';
import { Element } from '../entities/element.entity';

@Controller('elements')
export class ElementController {
  constructor(private readonly elementService: ElementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createElementDto: CreateElementDto): Promise<Element> {
    return this.elementService.create(createElementDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  bulkCreate(@Body() elements: CreateElementDto[]): Promise<Element[]> {
    return this.elementService.bulkCreate(elements);
  }

  @Get()
  findAll(): Promise<Element[]> {
    return this.elementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Element> {
    return this.elementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateElementDto: UpdateElementDto): Promise<Element> {
    return this.elementService.update(+id, updateElementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.elementService.remove(+id);
  }
}
