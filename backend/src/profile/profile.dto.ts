import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Skill } from '../skill/skill.entity';
import { CardStyleConfig } from '../card-style-config/card-style-config.entity';

@ObjectType()
export class ProfileStats {
  @Field(() => Int)
  totalSkills: number;

  @Field(() => Int)
  totalVisits: number;

  @Field(() => Int)
  averageProficiency: number;
}

@ObjectType()
export class UserProfile {
  @Field(() => User)
  user: User;

  @Field(() => [Skill])
  skills: Skill[];

  @Field(() => CardStyleConfig, { nullable: true })
  styleConfig?: CardStyleConfig;

  @Field(() => ProfileStats)
  stats: ProfileStats;
}