import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { DrawingService } from './drawing.service'
import { Drawing } from './entities/drawing.entity'
import { Version } from './entities/version.entity'
import { CreateDrawingInput } from './dto/create-drawing.input'
import { UpdateDrawingInput } from './dto/update-drawing.input'

@Resolver(() => Drawing)
export class DrawingResolver {
  constructor(private readonly drawingService: DrawingService) {}

  @Mutation(() => Drawing)
  createDrawing(@Args('createDrawingInput') createDrawingInput: CreateDrawingInput) {
    return this.drawingService.create(createDrawingInput)
  }

  @Query(() => [Drawing], { name: 'drawings' })
  findAll() {
    return this.drawingService.findAll()
  }

  @Query(() => Drawing, { name: 'drawing' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.drawingService.findOne(id)
  }

  @Mutation(() => Drawing)
  updateDrawing(@Args('updateDrawingInput') updateDrawingInput: UpdateDrawingInput) {
    return this.drawingService.update(updateDrawingInput)
  }

  @Mutation(() => Boolean)
  removeDrawing(@Args('id', { type: () => String }) id: string) {
    return this.drawingService.remove(id)
  }

  @Query(() => [Version], { name: 'drawingVersions' })
  getVersions(@Args('drawingId', { type: () => String }) drawingId: string) {
    return this.drawingService.getVersions(drawingId)
  }

  @Query(() => String, { name: 'exportSVG' })
  exportSVG(@Args('id', { type: () => String }) id: string) {
    return this.drawingService.exportSVG(id)
  }
}
