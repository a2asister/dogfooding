import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { UserModule } from '../user/user.module';
import { SkillModule } from '../skill/skill.module';
import { CardStyleConfigModule } from '../card-style-config/card-style-config.module';
import { VisitRecordModule } from '../visit-record/visit-record.module';

@Module({
  imports: [
    UserModule,
    SkillModule,
    CardStyleConfigModule,
    VisitRecordModule,
  ],
  providers: [ProfileService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}