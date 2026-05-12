import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FileService } from './file.service';
import { FileEntity } from './file.entity';
import { CreateFileInput } from './dto/create-file.input';

@Resolver(() => FileEntity)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  @Mutation(() => FileEntity)
  async createFile(@Args('input') input: CreateFileInput): Promise<FileEntity> {
    return this.fileService.createFile(input);
  }

  @Query(() => FileEntity, { nullable: true })
  async file(@Args('id') id: string): Promise<FileEntity | null> {
    return this.fileService.getFile(id);
  }

  @Query(() => [FileEntity])
  async files(): Promise<FileEntity[]> {
    return this.fileService.getFiles();
  }

  @Query(() => Int)
  async uploadProgress(@Args('id') id: string): Promise<number> {
    const file = await this.fileService.getFile(id);
    if (!file) return 0;
    return this.fileService.getUploadProgress(file);
  }

  @Mutation(() => Boolean)
  async deleteFile(@Args('id') id: string): Promise<boolean> {
    return this.fileService.deleteFile(id);
  }
}
