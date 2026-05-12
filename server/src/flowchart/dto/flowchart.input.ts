import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, IsArray } from 'class-validator'

@InputType()
class NodePositionInput {
  @Field()
  x: number

  @Field()
  y: number

  @Field()
  z: number
}

@InputType()
class NodeInput {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  type: string

  @Field(() => NodePositionInput)
  position: NodePositionInput

  @Field()
  collapsed: boolean

  @Field(() => [String])
  children: string[]
}

@InputType()
class ConnectionInput {
  @Field()
  id: string

  @Field()
  from: string

  @Field()
  to: string
}

@InputType()
export class FlowchartInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  id?: string

  @Field()
  @IsString()
  name: string

  @Field(() => [NodeInput])
  @IsArray()
  nodes: NodeInput[]

  @Field(() => [ConnectionInput])
  @IsArray()
  connections: ConnectionInput[]
}
