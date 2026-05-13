import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { CardStyleConfigService } from '../card-style-config/card-style-config.service';
import { VisitRecordService } from '../visit-record/visit-record.service';
import { UserProfile } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private userService: UserService,
    private skillService: SkillService,
    private cardStyleConfigService: CardStyleConfigService,
    private visitRecordService: VisitRecordService,
  ) {}

  async getProfile(userId: number, visitorIp?: string, userAgent?: string): Promise<UserProfile> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.isPublic) {
      throw new ForbiddenException('该用户主页为私密状态');
    }

    if (visitorIp) {
      await this.visitRecordService.recordVisit(userId, visitorIp, userAgent);
    }

    const skills = await this.skillService.findByUserId(userId);
    const styleConfig = await this.cardStyleConfigService.findByUserId(userId);
    const totalVisits = await this.visitRecordService.countByUserId(userId);

    const totalSkills = skills.length;
    const averageProficiency = skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.proficiency, 0) / skills.length)
      : 0;

    return {
      user,
      skills,
      styleConfig: styleConfig || undefined,
      stats: {
        totalSkills,
        totalVisits,
        averageProficiency,
      },
    };
  }

  async getProfileAdmin(userId: number): Promise<UserProfile> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const skills = await this.skillService.findByUserId(userId);
    const styleConfig = await this.cardStyleConfigService.findByUserId(userId);
    const totalVisits = await this.visitRecordService.countByUserId(userId);

    const totalSkills = skills.length;
    const averageProficiency = skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.proficiency, 0) / skills.length)
      : 0;

    return {
      user,
      skills,
      styleConfig: styleConfig || undefined,
      stats: {
        totalSkills,
        totalVisits,
        averageProficiency,
      },
    };
  }
}