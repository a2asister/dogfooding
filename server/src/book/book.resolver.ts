import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book], { description: '获取所有画册' })
  async books(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Query(() => Book, { description: '获取单个画册' })
  async book(@Args('id', { type: () => ID }) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Query(() => [Book], { description: '获取用户个人画册库' })
  async userBooks(@Args('userId', { type: () => ID }) userId: string): Promise<Book[]> {
    return this.bookService.findByUserId(userId);
  }

  @Query(() => [Book], { description: '获取公开画册' })
  async publicBooks(): Promise<Book[]> {
    return this.bookService.findPublicBooks();
  }

  @Query(() => [Book], { description: '搜索画册' })
  async searchBooks(@Args('keyword') keyword: string): Promise<Book[]> {
    return this.bookService.searchBooks(keyword);
  }

  @Query(() => Book, { description: '通过分享码获取画册' })
  async bookByShareCode(@Args('shareCode') shareCode: string): Promise<Book> {
    return this.bookService.findByShareCode(shareCode);
  }

  @Mutation(() => Book, { description: '创建画册' })
  async createBook(@Args('createBookInput') createBookInput: CreateBookInput): Promise<Book> {
    return this.bookService.create(createBookInput);
  }

  @Mutation(() => Book, { description: '更新画册' })
  async updateBook(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateBookInput') updateBookInput: UpdateBookInput,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookInput);
  }

  @Mutation(() => Boolean, { description: '删除画册' })
  async deleteBook(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.bookService.remove(id);
  }

  @Mutation(() => Book, { description: '分享画册' })
  async shareBook(@Args('id', { type: () => ID }) id: string): Promise<Book> {
    return this.bookService.shareBook(id);
  }

  @Mutation(() => Book, { description: '取消分享画册' })
  async unshareBook(@Args('id', { type: () => ID }) id: string): Promise<Book> {
    return this.bookService.unshareBook(id);
  }
}
