import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { CreateMeetingInput } from './dto/create-meeting.input';
import { UpdateMeetingInput } from './dto/update-meeting.input';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(() => Meeting)
export class MeetingResolver {
  constructor(private readonly meetingService: MeetingService) {}

  @Query(() => [Meeting])
  meetings() {
    return this.meetingService.findAll();
  }

  @Query(() => Meeting, { nullable: true })
  meeting(@Args('id', { type: () => Number }) id: number) {
    return this.meetingService.findOne(id);
  }

  @Query(() => Meeting, { nullable: true })
  activeMeeting() {
    return this.meetingService.getActiveMeeting();
  }

  @Mutation(() => Meeting)
  async createMeeting(@Args('input') input: CreateMeetingInput) {
    const meeting = await this.meetingService.create(input);
    pubSub.publish('meetingCreated', { meetingCreated: meeting });
    return meeting;
  }

  @Mutation(() => Meeting)
  async updateMeeting(@Args('input') input: UpdateMeetingInput) {
    const meeting = await this.meetingService.update(input.id, input);
    pubSub.publish('meetingUpdated', { meetingUpdated: meeting });
    return meeting;
  }

  @Mutation(() => Boolean)
  async deleteMeeting(@Args('id', { type: () => Number }) id: number) {
    return this.meetingService.remove(id);
  }

  @Subscription(() => Meeting)
  meetingCreated() {
    return pubSub.asyncIterator('meetingCreated');
  }

  @Subscription(() => Meeting)
  meetingUpdated() {
    return pubSub.asyncIterator('meetingUpdated');
  }
}
