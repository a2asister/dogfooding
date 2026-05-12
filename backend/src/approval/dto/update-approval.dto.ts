import { InputType, Field, ID } from '@nestjs/graphql';

export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

@InputType()
export class UpdateApprovalInput {
  @Field(() => ID)
  nodeId: number;

  @Field(() => String)
  action: ApprovalAction;

  @Field()
  approver: string;

  @Field({ nullable: true })
  comment?: string;
}
