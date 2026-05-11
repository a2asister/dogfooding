import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeNode } from './knowledge-node.entity';

interface UpdateLearnDto {
  isLearned: boolean;
}

@Controller('api/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll(): Promise<KnowledgeNode[]> {
    return this.knowledgeService.findAll();
  }

  @Put(':id/learn')
  updateLearnStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLearnDto,
  ): Promise<KnowledgeNode> {
    return this.knowledgeService.updateLearnStatus(id, body.isLearned);
  }
}
