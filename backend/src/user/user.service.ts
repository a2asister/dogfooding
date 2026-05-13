import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './user.model';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      include: { resumes: true, templates: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { resumes: true, templates: true },
    });
  }

  create(input: CreateUserInput) {
    return this.prisma.user.create({
      data: input,
      include: { resumes: true, templates: true },
    });
  }

  update(id: string, input: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data: input,
      include: { resumes: true, templates: true },
    });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return true;
  }
}
