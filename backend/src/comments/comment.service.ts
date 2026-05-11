import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

export interface CommentTree extends Comment {
  children: CommentTree[];
}

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create({
      id: uuidv4(),
      content: dto.content,
      author: dto.author,
      parentId: dto.parentId || null,
      likes: 0,
      isLiked: false,
    });

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
      comment.path = parent.path ? `${parent.path}.${comment.id}` : comment.id;
      comment.depth = (parent.depth || 0) + 1;
    } else {
      comment.path = comment.id;
      comment.depth = 0;
    }

    return this.commentRepository.save(comment);
  }

  async findAll(): Promise<CommentTree[]> {
    const comments = await this.commentRepository.find({
      order: { createdAt: 'ASC' },
    });

    return this.buildTree(comments);
  }

  async findAllGraphQL(fields: string[]): Promise<any[]> {
    const selectedFields = this.selectFields(fields);
    const comments = await this.commentRepository.find({
      select: selectedFields as any,
      order: { createdAt: 'ASC' },
    });
    return this.buildTree(comments);
  }

  async findOne(id: string, fields?: string[]): Promise<CommentTree> {
    const selectedFields = fields ? this.selectFields(fields) : undefined;
    const comment = await this.commentRepository.findOne({
      where: { id },
      select: selectedFields as any,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.path) {
      const pathPrefix = comment.path;
      const descendants = await this.commentRepository.find({
        where: { path: Like(`${pathPrefix}.%`) },
        order: { createdAt: 'ASC' },
        select: selectedFields as any,
      });

      const allComments = [comment, ...descendants];
      const tree = this.buildTree(allComments);
      return tree[0];
    }

    return { ...comment, children: [] };
  }

  async update(id: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    Object.assign(comment, dto);
    return this.commentRepository.save(comment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const idsToDelete = [id];
    if (comment.path) {
      const descendants = await this.commentRepository.find({
        where: { path: Like(`${comment.path}.%`) },
        select: ['id'],
      });
      idsToDelete.push(...descendants.map(d => d.id));
    }

    await this.commentRepository.delete({ id: In(idsToDelete) });
  }

  async toggleLike(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    
    return this.commentRepository.save(comment);
  }

  private selectFields(fields: string[]): string[] {
    const validFields = ['id', 'content', 'author', 'parentId', 'path', 'depth', 'likes', 'isLiked', 'createdAt', 'updatedAt'];
    return fields.filter(f => validFields.includes(f));
  }

  private buildTree(comments: Comment[]): CommentTree[] {
    const map = new Map<string, CommentTree>();
    const roots: CommentTree[] = [];

    comments.forEach(comment => {
      map.set(comment.id, { ...comment, children: [] });
    });

    comments.forEach(comment => {
      const node = map.get(comment.id);
      if (comment.parentId && map.has(comment.parentId)) {
        const parent = map.get(comment.parentId);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
