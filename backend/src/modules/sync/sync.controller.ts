import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { SyncService } from './sync.service';
import { UsersService } from '../users/users.service';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly usersService: UsersService,
  ) {}

  private async getCurrentUser(req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.usersService.findOne(userId);
  }

  @Post('start')
  async startSync(
    @Req() req: Request,
    @Body() body: { type: 'lan' | 'cloud'; deviceId: string },
  ) {
    const user = await this.getCurrentUser(req);
    const session = await this.syncService.startSyncSession(
      user,
      body.type,
      body.deviceId,
    );
    return {
      success: true,
      data: session,
    };
  }

  @Put(':id/progress')
  async updateProgress(
    @Param('id') sessionId: string,
    @Body() body: { progress: number; filesSynced: number },
  ) {
    const result = await this.syncService.updateSyncProgress(
      sessionId,
      body.progress,
      body.filesSynced,
    );
    if (!result) {
      throw new NotFoundException('Sync session not found');
    }
    return {
      success: true,
      data: result,
    };
  }

  @Put(':id/complete')
  async completeSync(
    @Param('id') sessionId: string,
    @Body() body: { success: boolean },
  ) {
    const result = await this.syncService.completeSyncSession(
      sessionId,
      body.success,
    );
    if (!result) {
      throw new NotFoundException('Sync session not found');
    }
    return {
      success: true,
      data: result,
    };
  }

  @Get('status/:id')
  async getSyncStatus(@Param('id') sessionId: string) {
    const status = await this.syncService.getSyncStatus(sessionId);
    if (!status) {
      throw new NotFoundException('Sync session not found');
    }
    return {
      success: true,
      data: status,
    };
  }

  @Get('history')
  async getSyncHistory(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const history = await this.syncService.getUserSyncHistory(user.id);
    return {
      success: true,
      data: history,
    };
  }

  @Get('active')
  async getActiveSessions(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const sessions = await this.syncService.getActiveSyncSessions(user.id);
    return {
      success: true,
      data: sessions,
    };
  }

  @Get('changes')
  async checkFileChanges(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const changes = await this.syncService.checkFileChanges(user);
    return {
      success: true,
      data: changes,
    };
  }

  @Post('delta')
  async calculateDelta(
    @Req() req: Request,
    @Body()
    body: {
      localFiles: { path: string; hash: string; size: number }[];
    },
  ) {
    const user = await this.getCurrentUser(req);
    const cloudFiles = []; // TODO: get actual cloud files
    const delta = await this.syncService.calculateSyncDelta(
      body.localFiles,
      cloudFiles,
    );
    return {
      success: true,
      data: delta,
    };
  }
}
