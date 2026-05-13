import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => Int }) id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(
    @Args('username') username: string,
    @Args('avatar', { nullable: true }) avatar?: string,
  ): Promise<User> {
    return this.userService.create(username, avatar);
  }

  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('username', { nullable: true }) username?: string,
    @Args('avatar', { nullable: true }) avatar?: string,
  ): Promise<User | null> {
    return this.userService.update(id, { username, avatar });
  }

  @Mutation(() => User, { nullable: true })
  async togglePrivacy(
    @Args('id', { type: () => Int }) id: number,
    @Args('isPublic') isPublic: boolean,
  ): Promise<User | null> {
    return this.userService.togglePrivacy(id, isPublic);
  }
}