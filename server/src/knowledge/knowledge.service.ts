import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeNode } from './knowledge-node.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeNode)
    private nodeRepository: Repository<KnowledgeNode>,
  ) {
    this.initializeData();
  }

  private async initializeData() {
    const count = await this.nodeRepository.count();
    if (count === 0) {
      const root = await this.nodeRepository.save({
        name: '知识体系',
        description: '整体知识体系的根节点',
        isLearned: true,
        orderIndex: 0,
      });

      const frontend = await this.nodeRepository.save({
        name: '前端开发',
        description: 'Web 前端技术栈',
        parentId: root.id,
        isLearned: true,
        orderIndex: 0,
      });

      const backend = await this.nodeRepository.save({
        name: '后端开发',
        description: '服务器端技术',
        parentId: root.id,
        isLearned: false,
        orderIndex: 1,
      });

      const database = await this.nodeRepository.save({
        name: '数据库',
        description: '数据存储技术',
        parentId: root.id,
        isLearned: false,
        orderIndex: 2,
      });

      await this.nodeRepository.save([
        { name: 'HTML/CSS', description: '网页结构与样式', parentId: frontend.id, isLearned: true, orderIndex: 0 },
        { name: 'JavaScript', description: '脚本编程语言', parentId: frontend.id, isLearned: true, orderIndex: 1 },
        { name: 'TypeScript', description: '类型安全的 JavaScript', parentId: frontend.id, isLearned: true, orderIndex: 2 },
        { name: 'SolidJS', description: '响应式前端框架', parentId: frontend.id, isLearned: false, orderIndex: 3 },
        { name: 'Node.js', description: '服务端 JavaScript', parentId: backend.id, isLearned: true, orderIndex: 0 },
        { name: 'NestJS', description: '企业级 Node 框架', parentId: backend.id, isLearned: false, orderIndex: 1 },
        { name: 'API 设计', description: 'RESTful 和 GraphQL', parentId: backend.id, isLearned: false, orderIndex: 2 },
        { name: 'SQLite', description: '轻量级数据库', parentId: database.id, isLearned: true, orderIndex: 0 },
        { name: 'PostgreSQL', description: '开源关系型数据库', parentId: database.id, isLearned: false, orderIndex: 1 },
        { name: 'Redis', description: '内存缓存数据库', parentId: database.id, isLearned: false, orderIndex: 2 },
      ]);
    }
  }

  async findAll(): Promise<KnowledgeNode[]> {
    return this.nodeRepository.find({
      order: { parentId: 'ASC', orderIndex: 'ASC' },
    });
  }

  async updateLearnStatus(id: number, isLearned: boolean): Promise<KnowledgeNode> {
    const node = await this.nodeRepository.findOne({ where: { id } });
    if (node) {
      node.isLearned = isLearned;
      return this.nodeRepository.save(node);
    }
    return null;
  }
}
