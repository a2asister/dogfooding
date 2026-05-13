import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserProfile } from './profile.dto';
import { ProfileService } from './profile.service';

@Resolver(() => UserProfile)
export class ProfileResolver {
  constructor(private profileService: ProfileService) {}

  @Query(() => UserProfile)
  async userProfile(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('visitorIp', { nullable: true }) visitorIp?: string,
    @Args('userAgent', { nullable: true }) userAgent?: string,
  ): Promise<UserProfile> {
    return this.profileService.getProfile(userId, visitorIp, userAgent);
  }

  @Query(() => UserProfile)
  async userProfileAdmin(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<UserProfile> {
    return this.profileService.getProfileAdmin(userId);
  }
}