import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalProcess } from './entities/approval-process.entity';
import { ApprovalNode, NodeStatus } from './entities/approval-node.entity';
import { UpdateApprovalInput, ApprovalAction } from './dto/update-approval.dto';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalProcess)
    private readonly processRepository: Repository<ApprovalProcess>,
    @InjectRepository(ApprovalNode)
    private readonly nodeRepository: Repository<ApprovalNode>,
  ) {}

  async findAll(): Promise<ApprovalProcess[]> {
    return this.processRepository.find({ relations: ['nodes'] });
  }

  async findOne(id: number): Promise<ApprovalProcess> {
    return this.processRepository.findOne({
      where: { id },
      relations: ['nodes'],
    });
  }

  async createSampleProcess(): Promise<ApprovalProcess> {
    const process = this.processRepository.create({
      name: '采购审批流程',
      description: '公司采购申请审批流程',
    });
    const savedProcess = await this.processRepository.save(process);

    const nodes = [
      { name: '提交申请', role: '申请人', order: 1 },
      { name: '部门主管审批', role: '部门主管', order: 2 },
      { name: '财务审核', role: '财务专员', order: 3 },
      { name: '总经理审批', role: '总经理', order: 4 },
      { name: '完成', role: '系统', order: 5 },
    ];

    for (let i = 0; i < nodes.length; i++) {
      const node = this.nodeRepository.create({
        ...nodes[i],
        status: i === 0 ? NodeStatus.CURRENT : NodeStatus.PENDING,
        processId: savedProcess.id,
      });
      await this.nodeRepository.save(node);
    }

    return this.findOne(savedProcess.id);
  }

  async updateApproval(input: UpdateApprovalInput): Promise<ApprovalNode> {
    const { nodeId, action, approver, comment } = input;

    const node = await this.nodeRepository.findOne({ where: { id: nodeId } });
    if (!node) {
      throw new BadRequestException('节点不存在');
    }

    if (node.status !== NodeStatus.CURRENT) {
      throw new BadRequestException('当前节点不可操作');
    }

    const nodes = await this.nodeRepository.find({
      where: { processId: node.processId },
      order: { order: 'ASC' },
    });

    const currentIndex = nodes.findIndex((n) => n.id === nodeId);

    if (action === ApprovalAction.APPROVE) {
      node.status = NodeStatus.APPROVED;
      node.approver = approver;
      node.comment = comment;
      node.approvedAt = new Date();
      await this.nodeRepository.save(node);

      if (currentIndex < nodes.length - 1) {
        const nextNode = nodes[currentIndex + 1];
        nextNode.status = NodeStatus.CURRENT;
        await this.nodeRepository.save(nextNode);
      }
    } else if (action === ApprovalAction.REJECT) {
      node.status = NodeStatus.REJECTED;
      node.approver = approver;
      node.comment = comment;
      node.approvedAt = new Date();
      await this.nodeRepository.save(node);
    }

    return this.nodeRepository.findOne({ where: { id: nodeId } });
  }

  hasPermission(userRole: string, nodeRole: string): boolean {
    const roleHierarchy = {
      申请人: ['申请人'],
      '部门主管': ['申请人', '部门主管'],
      '财务专员': ['申请人', '部门主管', '财务专员'],
      总经理: ['申请人', '部门主管', '财务专员', '总经理'],
    };

    return roleHierarchy[userRole]?.includes(nodeRole) ?? false;
  }
}
