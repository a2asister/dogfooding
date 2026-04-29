import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NoteVersionsService } from './note-versions.service';

@Controller('notes/:noteId/versions')
@UseGuards(AuthGuard('jwt'))
export class NoteVersionsController {
  constructor(private readonly noteVersionsService: NoteVersionsService) {}

  @Get()
  findByNoteId(@Request() req, @Param('noteId') noteId: string) {
    return this.noteVersionsService.findByNoteId(req.user.userId, parseInt(noteId));
  }

  @Get(':version')
  findOne(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('version') version: string
  ) {
    return this.noteVersionsService.findOne(
      req.user.userId,
      parseInt(noteId),
      parseInt(version)
    );
  }

  @Get(':version/restore')
  restoreVersion(
    @Request() req,
    @Param('noteId') noteId: string,
    @Param('version') version: string
  ) {
    return this.noteVersionsService.restoreVersion(
      req.user.userId,
      parseInt(noteId),
      parseInt(version)
    );
  }
}
