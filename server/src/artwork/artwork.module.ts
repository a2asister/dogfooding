import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Artwork } from './artwork.entity'
import { ArtworkService } from './artwork.service'
import { ArtworkResolver } from './artwork.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Artwork])],
  providers: [ArtworkService, ArtworkResolver]
})
export class ArtworkModule {}
