import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingProgress } from './reading-progress.entity';
import { CreateReadingProgressInput } from './dto/create-reading-progress.input';
import { UpdateReadingProgressInput } from './dto/update-reading-progress.input';

@Resolver(() => ReadingProgress)
export class ReadingProgressResolver {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Query(() => [ReadingProgress], { description: '获取所有阅读进度' })
  async readingProgresses(): Promise<ReadingProgress[]> {
    return this.readingProgressService.findAll();
  }

  @Query(() => ReadingProgress, { description: '获取单个阅读进度' })
  async readingProgress(@Args('id', { type: () => ID }) id: string): Promise<ReadingProgress> {
    return this.readingProgressService.findOne(id);
  }

  @Query(() => ReadingProgress, { nullable: true, description: '获取用户某本书的阅读进度' })
  async readingProgressByUserAndBook(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('bookId', { type: () => ID }) bookId: string,
  ): Promise<ReadingProgress | null> {
    return this.readingProgressService.findByUserAndBook(userId, bookId);
  }

  @Query(() => [ReadingProgress], { description: '获取用户的所有阅读进度' })
  async readingProgressesByUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ReadingProgress[]> {
    return this.readingProgressService.findByUser(userId);
  }

  @Query(() => [ReadingProgress], { description: '获取用户的书签列表' })
  async bookmarkedBooksByUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<ReadingProgress[]> {
    return this.readingProgressService.findBookmarkedByUser(userId);
  }

  @Mutation(() => ReadingProgress, { description: '创建或更新阅读进度' })
  async createReadingProgress(
    @Args('createReadingProgressInput') createReadingProgressInput: CreateReadingProgressInput,
  ): Promise<ReadingProgress> {
    return this.readingProgressService.create(createReadingProgressInput);
  }

  @Mutation(() => ReadingProgress, { description: '更新阅读进度' })
  async updateReadingProgress(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateReadingProgressInput') updateReadingProgressInput: UpdateReadingProgressInput,
  ): Promise<ReadingProgress> {
    return this.readingProgressService.update(id, updateReadingProgressInput);
  }

  @Mutation(() => Boolean, { description: '删除阅读进度' })
  async deleteReadingProgress(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.readingProgressService.remove(id);
  }
}
