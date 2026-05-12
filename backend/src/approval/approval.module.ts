import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalProcess } from './entities/approval-process.entity';
import { ApprovalNode } from './entities/approval-node.entity';
import { ApprovalService } from './approval.service';
import { ApprovalResolver } from './approval.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalProcess, ApprovalNode])],
  providers: [ApprovalService, ApprovalResolver],
})
export class ApprovalModule {}
