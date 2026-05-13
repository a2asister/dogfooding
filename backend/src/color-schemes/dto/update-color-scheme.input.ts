import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateColorSchemeInput } from './create-color-scheme.input';

@InputType()
export class UpdateColorSchemeInput extends PartialType(CreateColorSchemeInput) {
  @Field(() => ID)
  id: string;
}
