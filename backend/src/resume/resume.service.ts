import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeInput, UpdateResumeInput } from './resume.model';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      include: { template: true, user: true },
    });
  }

  findOne(id: string) {
    return this.prisma.resume.findUnique({
      where: { id },
      include: { template: true, user: true },
    });
  }

  create(input: CreateResumeInput) {
    return this.prisma.resume.create({
      data: input,
      include: { template: true, user: true },
    });
  }

  update(id: string, input: UpdateResumeInput) {
    return this.prisma.resume.update({
      where: { id },
      data: input,
      include: { template: true, user: true },
    });
  }

  async delete(id: string) {
    await this.prisma.resume.delete({ where: { id } });
    return true;
  }

  async export(id: string) {
    const resume = await this.findOne(id);
    if (!resume) throw new Error('Resume not found');
    return JSON.stringify({
      title: resume.title,
      content: JSON.parse(resume.content),
      layout: JSON.parse(resume.layout),
    });
  }
}
