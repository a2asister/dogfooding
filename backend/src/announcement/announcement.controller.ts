import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto, BatchUpdateDto, MarkReadDto } from './dto/update-announcement.dto';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.announcementService.findAll(userId);
  }

  @Get('admin')
  findAllAdmin() {
    return this.announcementService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.announcementService.findOne(+id, userId);
  }

  @Post()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(createAnnouncementDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(+id, updateAnnouncementDto);
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  batchUpdate(@Body() batchUpdateDto: BatchUpdateDto) {
    return this.announcementService.batchUpdate(batchUpdateDto);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.OK)
  batchRemove(@Body() body: { ids: number[] }) {
    return this.announcementService.batchRemove(body.ids);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementService.remove(+id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Body() markReadDto: MarkReadDto) {
    return this.announcementService.markAsRead(+id, markReadDto.userId);
  }
}
