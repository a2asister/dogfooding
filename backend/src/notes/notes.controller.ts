import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(req.user.userId, createNoteDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.userId);
  }

  @Get('search')
  search(@Request() req, @Query('q') query: string) {
    return this.notesService.search(req.user.userId, query);
  }

  @Get('archive')
  getArchive(@Request() req) {
    return this.notesService.getArchiveByMonth(req.user.userId);
  }

  @Get('category/:categoryId')
  findByCategory(@Request() req, @Param('categoryId') categoryId: string) {
    return this.notesService.findByCategory(req.user.userId, parseInt(categoryId));
  }

  @Get('tag/:tagId')
  findByTag(@Request() req, @Param('tagId') tagId: string) {
    return this.notesService.findByTag(req.user.userId, parseInt(tagId));
  }

  @Get('date-range')
  findByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.notesService.findByDateRange(
      req.user.userId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.userId, parseInt(id));
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    return this.notesService.update(req.user.userId, parseInt(id), updateNoteDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.notesService.remove(req.user.userId, parseInt(id));
  }
}
