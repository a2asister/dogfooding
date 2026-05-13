import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VisitRecord } from './visit-record.entity';
import { VisitRecordService } from './visit-record.service';

@Resolver(() => VisitRecord)
export class VisitRecordResolver {
  constructor(private visitRecordService: VisitRecordService) {}

  @Query(() => Int)
  async visitCount(@Args('userId', { type: () => Int }) userId: number): Promise<number> {
    return this.visitRecordService.countByUserId(userId);
  }

  @Query(() => [VisitRecord])
  async visitRecords(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 50,
  ): Promise<VisitRecord[]> {
    return this.visitRecordService.findByUserId(userId, limit);
  }

  @Mutation(() => VisitRecord)
  async recordVisit(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('visitorIp', { nullable: true }) visitorIp?: string,
    @Args('userAgent', { nullable: true }) userAgent?: string,
  ): Promise<VisitRecord> {
    return this.visitRecordService.recordVisit(userId, visitorIp, userAgent);
  }
}