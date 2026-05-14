import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { CardService } from './card.service'
import { CreateCardDto, SendCardDto, ReceiveCardDto } from './dto/create-card.dto'
import { Card } from './card.entity'

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async create(@Body() createCardDto: CreateCardDto): Promise<Card> {
    return this.cardService.create(createCardDto)
  }

  @Post('send')
  async sendCard(@Body() sendCardDto: SendCardDto): Promise<Card> {
    return this.cardService.sendCard(sendCardDto)
  }

  @Post('receive')
  async receiveCard(@Body() receiveCardDto: ReceiveCardDto, @Query('userId') userId: number): Promise<Card> {
    return this.cardService.receiveCard(receiveCardDto, userId)
  }

  @Get()
  async findAll(@Query('userId') userId: number): Promise<{ sent: Card[]; received: Card[] }> {
    return this.cardService.findAll(userId || 1)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Card> {
    return this.cardService.findOne(Number(id))
  }

  @Get('share/:code')
  async findByShareCode(@Param('code') code: string): Promise<Card> {
    return this.cardService.findByShareCode(code)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Query('userId') userId: number): Promise<void> {
    return this.cardService.remove(Number(id), userId || 1)
  }
}
