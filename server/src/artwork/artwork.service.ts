import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Artwork } from './artwork.entity'
import { CreateArtworkInput } from './dto/create-artwork.input'

@Injectable()
export class ArtworkService {
  constructor(
    @InjectRepository(Artwork)
    private artworkRepository: Repository<Artwork>
  ) {}

  async findAll(): Promise<Artwork[]> {
    return this.artworkRepository.find({
      order: { createdAt: 'DESC' }
    })
  }

  async findOne(id: string): Promise<Artwork | null> {
    return this.artworkRepository.findOne({ where: { id } })
  }

  async create(input: CreateArtworkInput): Promise<Artwork> {
    const artwork = this.artworkRepository.create(input)
    return this.artworkRepository.save(artwork)
  }

  async toggleLike(id: string): Promise<Artwork | null> {
    const artwork = await this.findOne(id)
    if (!artwork) return null
    
    artwork.isLiked = !artwork.isLiked
    artwork.likes += artwork.isLiked ? 1 : -1
    
    return this.artworkRepository.save(artwork)
  }

  async toggleFavorite(id: string): Promise<Artwork | null> {
    const artwork = await this.findOne(id)
    if (!artwork) return null
    
    artwork.isFavorited = !artwork.isFavorited
    
    return this.artworkRepository.save(artwork)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.artworkRepository.delete(id)
    return (result.affected ?? 0) > 0
  }
}
