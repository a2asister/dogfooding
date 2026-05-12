import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { Flowchart } from './flowchart.entity'
import { FlowchartService } from './flowchart.service'
import { FlowchartInput } from './dto/flowchart.input'

@Resolver(() => Flowchart)
export class FlowchartResolver {
  constructor(private readonly flowchartService: FlowchartService) {}

  @Query(() => [Flowchart])
  async flowcharts(): Promise<Flowchart[]> {
    return this.flowchartService.findAll()
  }

  @Query(() => Flowchart)
  async flowchart(@Args('id') id: string): Promise<Flowchart> {
    return this.flowchartService.findOne(id)
  }

  @Mutation(() => Flowchart)
  async saveFlowchart(
    @Args('data') data: FlowchartInput
  ): Promise<Flowchart> {
    return this.flowchartService.save(data)
  }

  @Mutation(() => Boolean)
  async deleteFlowchart(@Args('id') id: string): Promise<boolean> {
    return this.flowchartService.delete(id)
  }
}
