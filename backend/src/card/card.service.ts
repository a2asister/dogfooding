import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Card } from './card.entity'
import { CreateCardDto, SendCardDto, ReceiveCardDto } from './dto/create-card.dto'
import { User } from '../user/user.entity'

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardRepository.create(createCardDto)
    card.shareCode = this.generateShareCode()
    return this.cardRepository.save(card)
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  async sendCard(sendCardDto: SendCardDto): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: sendCardDto.cardId }
    })
    
    if (!card) {
      throw new NotFoundException('贺卡不存在')
    }

    const receiver = await this.userRepository.findOne({
      where: { id: sendCardDto.receiverId }
    })

    if (!receiver) {
      throw new NotFoundException('接收用户不存在')
    }

    card.receiverId = sendCardDto.receiverId
    card.receiverName = receiver.nickname || receiver.username
    return this.cardRepository.save(card)
  }

  async receiveCard(receiveCardDto: ReceiveCardDto, userId: number): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { shareCode: receiveCardDto.shareCode }
    })
    
    if (!card) {
      throw new NotFoundException('贺卡不存在或分享码无效')
    }

    if (card.isReceived) {
      throw new BadRequestException('该贺卡已被接收')
    }

    card.receiverId = userId
    card.isReceived = true
    card.receivedAt = new Date()
    
    return this.cardRepository.save(card)
  }

  async findAll(userId: number): Promise<{ sent: Card[]; received: Card[] }> {
    const sent = await this.cardRepository.find({
      where: { senderId: userId },
      order: { createdAt: 'DESC' }
    })

    const received = await this.cardRepository.find({
      where: { receiverId: userId },
      order: { createdAt: 'DESC' }
    })

    return { sent, received }
  }

  async findOne(id: number): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id } })
    if (!card) {
      throw new NotFoundException('贺卡不存在')
    }
    return card
  }

  async findByShareCode(shareCode: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { shareCode } })
    if (!card) {
      throw new NotFoundException('贺卡不存在或分享码无效')
    }
    return card
  }

  async remove(id: number, userId: number): Promise<void> {
    const card = await this.cardRepository.findOne({ where: { id } })
    if (!card) {
      throw new NotFoundException('贺卡不存在')
    }
    
    if (card.senderId !== userId && card.receiverId !== userId) {
      throw new BadRequestException('无权删除此贺卡')
    }

    await this.cardRepository.delete(id)
  }
}
