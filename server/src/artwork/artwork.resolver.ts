import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { Artwork } from './artwork.entity'
import { ArtworkService } from './artwork.service'
import { CreateArtworkInput } from './dto/create-artwork.input'

@Resolver(() => Artwork)
export class ArtworkResolver {
  constructor(private readonly artworkService: ArtworkService) {}

  @Query(() => [Artwork], { name: 'artworks' })
  async getArtworks() {
    return this.artworkService.findAll()
  }

  @Query(() => Artwork, { name: 'artwork', nullable: true })
  async getArtwork(@Args('id', { type: () => String }) id: string) {
    return this.artworkService.findOne(id)
  }

  @Mutation(() => Artwork)
  async createArtwork(@Args('input') input: CreateArtworkInput) {
    return this.artworkService.create(input)
  }

  @Mutation(() => Artwork, { nullable: true })
  async toggleLike(@Args('id', { type: () => String }) id: string) {
    return this.artworkService.toggleLike(id)
  }

  @Mutation(() => Artwork, { nullable: true })
  async toggleFavorite(@Args('id', { type: () => String }) id: string) {
    return this.artworkService.toggleFavorite(id)
  }

  @Mutation(() => Boolean)
  async deleteArtwork(@Args('id', { type: () => String }) id: string) {
    return this.artworkService.delete(id)
  }
}
