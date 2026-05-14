import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeRecord } from '../entities/practice-record.entity';
import { ErrorCharacter } from '../entities/error-character.entity';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeRecord)
    private practiceRecordRepository: Repository<PracticeRecord>,
    @InjectRepository(ErrorCharacter)
    private errorCharacterRepository: Repository<ErrorCharacter>,
  ) {}

  async createRecord(record: Omit<PracticeRecord, 'id'>): Promise<PracticeRecord> {
    const newRecord = this.practiceRecordRepository.create(record);
    const savedRecord = await this.practiceRecordRepository.save(newRecord);

    if (!record.correct) {
      await this.updateErrorCharacter(record.characterId, record.character);
    }

    return savedRecord;
  }

  private async updateErrorCharacter(characterId: string, character: string): Promise<void> {
    let errorChar = await this.errorCharacterRepository.findOne({
      where: { characterId },
    });

    if (errorChar) {
      errorChar.errorCount += 1;
      errorChar.lastError = Date.now();
    } else {
      errorChar = this.errorCharacterRepository.create({
        characterId,
        character,
        errorCount: 1,
        lastError: Date.now(),
      });
    }

    await this.errorCharacterRepository.save(errorChar);
  }

  async getRecords(): Promise<PracticeRecord[]> {
    return this.practiceRecordRepository.find({ order: { timestamp: 'DESC' } });
  }

  async getErrorCharacters(): Promise<ErrorCharacter[]> {
    return this.errorCharacterRepository.find({ order: { errorCount: 'DESC' } });
  }
}
