import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { ShareService } from './share.service';
import { UsersService } from '../users/users.service';

@Controller('share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly usersService: UsersService,
  ) {}

  private async getCurrentUser(req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.usersService.findOne(userId);
  }

  @Post()
  async createShare(
    @Req() req: Request,
    @Body()
    body: {
      fileId: string;
      sharedWithUsername: string;
      permission: 'read' | 'write' | 'readwrite';
      expiresInHours?: number;
    },
  ) {
    const user = await this.getCurrentUser(req);
    if (!body.fileId || !body.sharedWithUsername || !body.permission) {
      throw new BadRequestException('Missing required fields');
    }
    const share = await this.shareService.createShare(
      user,
      body.fileId,
      body.sharedWithUsername,
      body.permission,
      body.expiresInHours,
    );
    return {
      success: true,
      data: share,
    };
  }

  @Get('my-shares')
  async getMyShares(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const shares = await this.shareService.getSharesByOwner(user);
    return {
      success: true,
      data: shares,
    };
  }

  @Get('shared-with-me')
  async getSharedWithMe(@Req() req: Request) {
    const user = await this.getCurrentUser(req);
    const shares = await this.shareService.getSharesSharedWithUser(user);
    return {
      success: true,
      data: shares,
    };
  }

  @Get(':id')
  async getShareById(@Param('id') shareId: string) {
    const share = await this.shareService.getShareById(shareId);
    return {
      success: true,
      data: share,
    };
  }

  @Delete(':id')
  async revokeShare(@Req() req: Request, @Param('id') shareId: string) {
    const user = await this.getCurrentUser(req);
    const result = await this.shareService.revokeShare(user, shareId);
    return {
      success: true,
      data: { revoked: result },
    };
  }

  @Put(':id/permission')
  async updatePermission(
    @Req() req: Request,
    @Param('id') shareId: string,
    @Body('permission') permission: 'read' | 'write' | 'readwrite',
  ) {
    if (!permission) {
      throw new BadRequestException('Permission is required');
    }
    const user = await this.getCurrentUser(req);
    const share = await this.shareService.updateSharePermission(
      user,
      shareId,
      permission,
    );
    return {
      success: true,
      data: share,
    };
  }

  @Post('check')
  async checkPermission(
    @Req() req: Request,
    @Body() body: { fileId: string; permission: 'read' | 'write' | 'readwrite' },
  ) {
    const user = await this.getCurrentUser(req);
    if (!body.fileId || !body.permission) {
      throw new BadRequestException('Missing required fields');
    }
    const hasPermission = await this.shareService.checkPermission(
      user,
      body.fileId,
      body.permission,
    );
    return {
      success: true,
      data: { hasPermission },
    };
  }
}
