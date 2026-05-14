import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator'

export class CreateCardDto {
  @IsString()
  title: string = ''

  @IsString()
  message: string = ''

  @IsString()
  senderName: string = ''

  @IsString()
  receiverName: string = ''

  @IsString()
  background: string = ''

  @IsOptional()
  @IsString()
  music: string = ''

  @IsOptional()
  @IsArray()
  decorations: Array<{ id: number; emoji: string; x: number; y: number }> = []

  @IsOptional()
  @IsNumber()
  senderId: number | null = null

  @IsOptional()
  @IsNumber()
  receiverId: number | null = null
}

export class SendCardDto {
  @IsNumber()
  cardId: number = 0

  @IsNumber()
  receiverId: number = 0
}

export class ReceiveCardDto {
  @IsString()
  shareCode: string = ''
}
