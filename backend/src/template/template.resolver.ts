import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TemplateService } from './template.service';
import { Template, CreateTemplateInput, UpdateTemplateInput } from './template.model';

@Resolver(() => Template)
export class TemplateResolver {
  constructor(private readonly templateService: TemplateService) {}

  @Query(() => [Template])
  async templates(@Args('userId') userId: string) {
    return this.templateService.findAll(userId);
  }

  @Query(() => Template, { nullable: true })
  async template(@Args('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Mutation(() => Template)
  async createTemplate(@Args('input') input: CreateTemplateInput) {
    return this.templateService.create(input);
  }

  @Mutation(() => Template)
  async updateTemplate(@Args('id') id: string, @Args('input') input: UpdateTemplateInput) {
    return this.templateService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteTemplate(@Args('id') id: string) {
    return this.templateService.delete(id);
  }
}
