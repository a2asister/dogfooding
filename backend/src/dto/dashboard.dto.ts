import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

@InputType()
export class CreateDashboardInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  config!: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}

@InputType()
export class UpdateDashboardInput {
  @Field(() => ID)
  @IsUUID()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  config?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}
