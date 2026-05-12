import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Config } from './config.entity';
import { ConfigService } from './config.service';
import { CreateConfigInput, UpdateConfigInput } from './config.dto';

@Resolver(() => Config)
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query(() => [Config])
  async configs(): Promise<Config[]> {
    return this.configService.findAll();
  }

  @Query(() => Config)
  async config(@Args('id', { type: () => ID }) id: string): Promise<Config> {
    return this.configService.findOne(id);
  }

  @Query(() => [Config])
  async configsByGroup(@Args('group') group: string): Promise<Config[]> {
    return this.configService.findByGroup(group);
  }

  @Query(() => String)
  async exportConfigs(): Promise<string> {
    return this.configService.exportAll();
  }

  @Mutation(() => Config)
  async createConfig(@Args('input') input: CreateConfigInput): Promise<Config> {
    return this.configService.create(input);
  }

  @Mutation(() => Config)
  async updateConfig(@Args('input') input: UpdateConfigInput): Promise<Config> {
    return this.configService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  async deleteConfig(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.configService.remove(id);
  }

  @Mutation(() => [Config])
  async importConfigs(@Args('jsonString') jsonString: string): Promise<Config[]> {
    return this.configService.importAll(jsonString);
  }
}
