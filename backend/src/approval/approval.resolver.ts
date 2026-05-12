import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ApprovalProcess } from './entities/approval-process.entity';
import { ApprovalNode } from './entities/approval-node.entity';
import { ApprovalService } from './approval.service';
import { UpdateApprovalInput } from './dto/update-approval.dto';

@Resolver(() => ApprovalProcess)
export class ApprovalResolver {
  constructor(private readonly approvalService: ApprovalService) {}

  @Query(() => [ApprovalProcess])
  async approvalProcesses() {
    return this.approvalService.findAll();
  }

  @Query(() => ApprovalProcess, { nullable: true })
  async approvalProcess(@Args('id', { type: () => ID }) id: number) {
    return this.approvalService.findOne(id);
  }

  @Mutation(() => ApprovalProcess)
  async createSampleApprovalProcess() {
    return this.approvalService.createSampleProcess();
  }

  @Mutation(() => ApprovalNode)
  async updateApproval(@Args('input') input: UpdateApprovalInput) {
    return this.approvalService.updateApproval(input);
  }

  @Query(() => Boolean)
  async checkPermission(
    @Args('userRole') userRole: string,
    @Args('nodeRole') nodeRole: string,
  ) {
    return this.approvalService.hasPermission(userRole, nodeRole);
  }
}
