import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { LogService } from './log.service';
import { Log } from './log.entity';
import { CreateLogInput } from './dto/create-log.input';

@Resolver(() => Log)
export class LogResolver {
  constructor(private readonly logService: LogService) {}

  @Query(() => [Log], { name: 'logs' })
  findAll() {
    return this.logService.findAll();
  }

  @Query(() => Log, { name: 'log' })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.logService.findOne(id);
  }

  @Query(() => [Log], { name: 'logsByCategory' })
  findByCategory(@Args('category') category: string) {
    return this.logService.findByCategory(category);
  }

  @Mutation(() => Log)
  createLog(@Args('createLogInput') createLogInput: CreateLogInput) {
    return this.logService.create(createLogInput);
  }

  @Mutation(() => Log)
  removeLog(@Args('id', { type: () => ID }) id: number) {
    return this.logService.remove(id);
  }
}
