import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateInput, UpdateTemplateInput } from './template.model';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.template.findMany({
      where: { userId },
      include: { resumes: true },
    });
  }

  findOne(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
      include: { resumes: true },
    });
  }

  create(input: CreateTemplateInput) {
    return this.prisma.template.create({
      data: input,
      include: { resumes: true },
    });
  }

  update(id: string, input: UpdateTemplateInput) {
    return this.prisma.template.update({
      where: { id },
      data: input,
      include: { resumes: true },
    });
  }

  async delete(id: string) {
    await this.prisma.template.delete({ where: { id } });
    return true;
  }
}
