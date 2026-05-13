import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!book) {
      throw new NotFoundException(`画册 ${id} 未找到`);
    }
    return book;
  }

  async findByUserId(userId: string): Promise<Book[]> {
    return this.bookRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async create(createBookInput: CreateBookInput): Promise<Book> {
    const book = this.bookRepository.create(createBookInput);
    return this.bookRepository.save(book);
  }

  async update(id: string, updateBookInput: UpdateBookInput): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookInput);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<boolean> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
    return true;
  }

  async findPublicBooks(): Promise<Book[]> {
    return this.bookRepository.find({
      where: { isPublic: true },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async searchBooks(keyword: string): Promise<Book[]> {
    return this.bookRepository
      .createQueryBuilder('book')
      .where('book.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('book.author LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('book.category LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }

  async shareBook(bookId: string): Promise<Book> {
    const book = await this.findOne(bookId);
    book.shareCode = this.generateShareCode();
    book.isShared = true;
    return this.bookRepository.save(book);
  }

  async unshareBook(bookId: string): Promise<Book> {
    const book = await this.findOne(bookId);
    book.shareCode = undefined;
    book.isShared = false;
    return this.bookRepository.save(book);
  }

  async findByShareCode(shareCode: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { shareCode, isShared: true },
      relations: ['user'],
    });
    if (!book) {
      throw new NotFoundException('分享链接无效或已过期');
    }
    return book;
  }

  private generateShareCode(): string {
    return (
      Math.random().toString(36).substring(2, 10) +
      Date.now().toString(36).substring(0, 4)
    ).toUpperCase();
  }
}
