import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { BrowseRecordService } from './browse-record.service';
import { BrowseRecord } from '../entities/browse-record.entity';

@ObjectType()
export class BrowseStats {
  @Field()
  total: number;
  
  @Field({ nullable: true })
  houseId?: number;
}

@Resolver(() => BrowseRecord)
export class BrowseRecordResolver {
  constructor(private readonly browseRecordService: BrowseRecordService) {}

  @Query(() => [BrowseRecord], { name: 'browseRecords' })
  findAll() {
    return this.browseRecordService.findAll();
  }

  @Query(() => [BrowseStats], { name: 'browseStats' })
  getStats(@Args('houseId', { type: () => ID, nullable: true }) houseId?: number) {
    return this.browseRecordService.getStats(houseId);
  }

  @Mutation(() => BrowseRecord)
  addBrowseRecord(
    @Args('houseId', { type: () => ID }) houseId: number,
    @Args('ipAddress') ipAddress: string,
    @Args('userId', { nullable: true }) userId?: string,
  ) {
    return this.browseRecordService.create(houseId, ipAddress, userId);
  }
}
