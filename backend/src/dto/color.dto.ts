import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType()
export class ColorRgb {
  @Field()
  r!: number;

  @Field()
  g!: number;

  @Field()
  b!: number;
}

@ObjectType()
export class ColorHsl {
  @Field()
  h!: number;

  @Field()
  s!: number;

  @Field()
  l!: number;
}

@ObjectType()
export class ColorPosition {
  @Field()
  x!: number;

  @Field()
  y!: number;
}

@ObjectType()
export class Color {
  @Field()
  hex!: string;

  @Field(() => ColorRgb)
  rgb!: ColorRgb;

  @Field(() => ColorHsl)
  hsl!: ColorHsl;

  @Field(() => ColorPosition, { nullable: true })
  position?: ColorPosition;
}

@ObjectType()
export class ColorRelationship {
  @Field()
  type!: string;

  @Field()
  color1!: string;

  @Field()
  color2!: string;

  @Field()
  strength!: number;
}

@ObjectType()
export class ColorStatistics {
  @Field()
  brightness!: number;

  @Field()
  saturation!: number;

  @Field()
  warmth!: number;

  @Field()
  contrast!: number;
}

@ObjectType()
export class ColorPalette {
  @Field(() => [Color])
  colors!: Color[];

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field(() => [ColorRelationship], { nullable: true })
  relationships?: ColorRelationship[];
}

@ObjectType()
export class ImageAnalysisResult {
  @Field(() => [Color])
  colors!: Color[];

  @Field(() => Color)
  dominantColor!: Color;

  @Field(() => ColorStatistics)
  statistics!: ColorStatistics;
}

@InputType()
export class SavePaletteInput {
  @Field()
  name!: string;

  @Field(() => [String])
  colors!: string[];

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  emotion?: string;
}
