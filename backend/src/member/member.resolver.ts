import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'
import { Member } from './member.entity'
import { MemberService } from './member.service'
import { UpdateMemberInput, AuthUser } from './member.dto'

@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => [Member])
  async members() {
    return this.memberService.findAll()
  }

  @Query(() => Member, { nullable: true })
  async member(@Args('id', { type: () => ID }) id: string) {
    return this.memberService.findOne(id)
  }

  @Mutation(() => Member)
  async updateMember(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMemberInput,
  ) {
    return this.memberService.update(id, input)
  }

  @Mutation(() => AuthUser)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.memberService.login(email, password)
  }

  @Mutation(() => Member)
  async heartbeat(@Args('userId', { type: () => ID }) userId: string) {
    return this.memberService.heartbeat(userId)
  }

  @Mutation(() => Boolean)
  async logout(@Args('userId', { type: () => ID }) userId: string) {
    return this.memberService.logout(userId)
  }
}
