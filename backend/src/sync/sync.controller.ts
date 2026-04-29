import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(AuthGuard('jwt'))
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  getStatus(@Request() req) {
    return this.syncService.getSyncStatus(req.user.userId);
  }

  @Get('pending')
  getPendingChanges(@Request() req, @Query('since') since?: string) {
    const sinceDate = since ? new Date(since) : undefined;
    return this.syncService.getPendingChanges(req.user.userId, sinceDate);
  }

  @Post('mark-synced')
  markAsSynced(@Request() req, @Body() body: { recordIds: number[] }) {
    return this.syncService.markAsSynced(req.user.userId, body.recordIds);
  }

  @Post('all')
  syncAll(@Request() req) {
    return this.syncService.syncAll(req.user.userId);
  }

  @Get('history')
  getSyncHistory(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.syncService.getSyncHistory(req.user.userId, limitNum);
  }
}
