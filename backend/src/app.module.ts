import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WallpaperModule } from './wallpaper/wallpaper.module';
import { DeviceConfigModule } from './device-config/device-config.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';
import { Wallpaper } from './entity/wallpaper.entity';
import { DeviceConfig } from './entity/device-config.entity';
import { UserPreference } from './entity/user-preference.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'wallpaper.db',
      entities: [Wallpaper, DeviceConfig, UserPreference],
      synchronize: true,
    }),
    WallpaperModule,
    DeviceConfigModule,
    UserPreferenceModule,
  ],
})
export class AppModule {}