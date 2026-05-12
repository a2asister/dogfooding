import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Meeting } from './meeting.entity';
import { CreateMeetingInput } from './dto/create-meeting.input';
import { UpdateMeetingInput } from './dto/update-meeting.input';

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
  ) {}

  async findAll(): Promise<Meeting[]> {
    return this.meetingRepository.find();
  }

  async findOne(id: number): Promise<Meeting | null> {
    return this.meetingRepository.findOne({ where: { id } });
  }

  async create(input: CreateMeetingInput): Promise<Meeting> {
    const meeting = this.meetingRepository.create(input);
    return this.meetingRepository.save(meeting);
  }

  async update(id: number, input: UpdateMeetingInput): Promise<Meeting | null> {
    const meeting = await this.findOne(id);
    if (!meeting) {
      return null;
    }
    
    const now = new Date();
    const startTime = input.startTime || meeting.startTime;
    const endTime = input.endTime || meeting.endTime;
    
    let isActive = false;
    let isCompleted = false;
    
    if (startTime <= now && endTime > now) {
      isActive = true;
    } else if (endTime <= now) {
      isCompleted = true;
    }
    
    await this.meetingRepository.update(id, {
      ...input,
      isActive,
      isCompleted,
    });
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.meetingRepository.delete(id);
    return result.affected > 0;
  }

  @Cron(CronExpression.EVERY_SECOND)
  async checkMeetingStatus() {
    const now = new Date();
    const meetings = await this.meetingRepository.find();

    for (const meeting of meetings) {
      if (!meeting.isCompleted && !meeting.isActive) {
        if (meeting.startTime <= now && meeting.endTime > now) {
          meeting.isActive = true;
          await this.meetingRepository.save(meeting);
          this.logger.log(`Meeting "${meeting.title}" has started!`);
        }
      } else if (meeting.isActive) {
        if (meeting.endTime <= now) {
          meeting.isActive = false;
          meeting.isCompleted = true;
          await this.meetingRepository.save(meeting);
          this.logger.log(`Meeting "${meeting.title}" has ended!`);
        }
      }
    }
  }

  async getActiveMeeting(): Promise<Meeting | null> {
    const meetings = await this.meetingRepository.find({
      where: { isActive: true },
    });
    return meetings[0] || null;
  }
}
