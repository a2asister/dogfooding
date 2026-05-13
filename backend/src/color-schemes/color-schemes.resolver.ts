import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ColorSchemesService } from './color-schemes.service';
import { ColorScheme } from './entities/color-scheme.entity';
import { CreateColorSchemeInput } from './dto/create-color-scheme.input';
import { UpdateColorSchemeInput } from './dto/update-color-scheme.input';

@Resolver(() => ColorScheme)
export class ColorSchemesResolver {
  constructor(private readonly colorSchemesService: ColorSchemesService) {}

  @Mutation(() => ColorScheme)
  createColorScheme(@Args('createColorSchemeInput') createColorSchemeInput: CreateColorSchemeInput) {
    return this.colorSchemesService.create(createColorSchemeInput);
  }

  @Query(() => [ColorScheme], { name: 'colorSchemes' })
  findAll() {
    return this.colorSchemesService.findAll();
  }

  @Query(() => [ColorScheme], { name: 'favoriteColorSchemes' })
  findFavorites() {
    return this.colorSchemesService.findFavorites();
  }

  @Query(() => [ColorScheme], { name: 'archivedColorSchemes' })
  findArchived() {
    return this.colorSchemesService.findArchived();
  }

  @Query(() => [ColorScheme], { name: 'colorSchemeTemplates' })
  findTemplates() {
    return this.colorSchemesService.findTemplates();
  }

  @Query(() => ColorScheme, { name: 'colorScheme' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.colorSchemesService.findOne(id);
  }

  @Mutation(() => ColorScheme)
  updateColorScheme(@Args('updateColorSchemeInput') updateColorSchemeInput: UpdateColorSchemeInput) {
    return this.colorSchemesService.update(updateColorSchemeInput.id, updateColorSchemeInput);
  }

  @Mutation(() => ColorScheme)
  removeColorScheme(@Args('id', { type: () => ID }) id: string) {
    return this.colorSchemesService.remove(id);
  }

  @Mutation(() => ColorScheme)
  toggleFavorite(@Args('id', { type: () => ID }) id: string) {
    return this.colorSchemesService.toggleFavorite(id);
  }

  @Mutation(() => ColorScheme)
  toggleArchive(@Args('id', { type: () => ID }) id: string) {
    return this.colorSchemesService.toggleArchive(id);
  }
}
