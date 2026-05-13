import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { description: '获取所有用户' })
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { description: '获取单个用户' })
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User, { description: '创建用户' })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User, { description: '获取或创建用户' })
  async getOrCreateUser(
    @Args('username') username: string,
    @Args('nickname', { nullable: true }) nickname?: string,
  ): Promise<User> {
    return this.userService.getOrCreate(username, nickname);
  }
}
