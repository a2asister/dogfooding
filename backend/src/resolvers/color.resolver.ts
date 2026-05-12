import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColorTheoryService } from '../services/color-theory.service';
import { ImageAnalysisService } from '../services/image-analysis.service';
import { Palette } from '../entities/palette.entity';
import { ColorPalette, ImageAnalysisResult, SavePaletteInput } from '../dto/color.dto';

@Resolver(() => Palette)
export class ColorResolver {
  constructor(
    private readonly colorTheoryService: ColorTheoryService,
    private readonly imageAnalysisService: ImageAnalysisService,
    @InjectRepository(Palette)
    private readonly paletteRepository: Repository<Palette>
  ) {}

  @Query(() => ColorPalette)
  async generateEmotionalPalette(
    @Args('emotion') emotion: string
  ): Promise<ColorPalette> {
    const palette = this.colorTheoryService.generateEmotionalPalette(emotion);
    const relationships = this.colorTheoryService.getColorRelationships(
      palette.colors.map(c => c.hex)
    );
    return { ...palette, relationships };
  }

  @Query(() => ColorPalette)
  async generateComplementaryPalette(
    @Args('baseColor') baseColor: string
  ): Promise<ColorPalette> {
    const complementary = this.colorTheoryService.getComplementary(baseColor);
    const colors = [baseColor, complementary].map(hex =>
      this.colorTheoryService.colorToObject(hex)
    );
    return {
      colors,
      name: 'Complementary Palette',
      type: 'complementary',
      relationships: this.colorTheoryService.getColorRelationships([baseColor, complementary]),
    };
  }

  @Query(() => ColorPalette)
  async generateAnalogousPalette(
    @Args('baseColor') baseColor: string
  ): Promise<ColorPalette> {
    const analogous = this.colorTheoryService.getAnalogous(baseColor, 5);
    const colors = analogous.map(hex => this.colorTheoryService.colorToObject(hex));
    return {
      colors,
      name: 'Analogous Palette',
      type: 'analogous',
      relationships: this.colorTheoryService.getColorRelationships(analogous),
    };
  }

  @Query(() => ColorPalette)
  async generateTriadicPalette(
    @Args('baseColor') baseColor: string
  ): Promise<ColorPalette> {
    const triadic = this.colorTheoryService.getTriadic(baseColor);
    const colors = triadic.map(hex => this.colorTheoryService.colorToObject(hex));
    return {
      colors,
      name: 'Triadic Palette',
      type: 'triadic',
      relationships: this.colorTheoryService.getColorRelationships(triadic),
    };
  }

  @Mutation(() => ImageAnalysisResult)
  async extractColorsFromImage(
    @Args('base64Image') base64Image: string,
    @Args('colorCount', { defaultValue: 5 }) colorCount: number
  ): Promise<ImageAnalysisResult> {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { colors, dominantColor } = await this.imageAnalysisService.extractColorsFromImage(
      buffer,
      colorCount
    );
    const statistics = await this.imageAnalysisService.getColorStatistics(buffer);

    return { colors, dominantColor, statistics };
  }

  @Mutation(() => Palette)
  async savePalette(
    @Args('input') input: SavePaletteInput
  ): Promise<Palette> {
    const palette = this.paletteRepository.create(input);
    return this.paletteRepository.save(palette);
  }

  @Query(() => [Palette])
  async getSavedPalettes(): Promise<Palette[]> {
    return this.paletteRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Mutation(() => Boolean)
  async deletePalette(@Args('id') id: string): Promise<boolean> {
    const result = await this.paletteRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
