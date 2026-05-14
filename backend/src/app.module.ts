import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothingModule } from './clothing/clothing.module';
import { OutfitModule } from './outfit/outfit.module';
import { PreferenceModule } from './preference/preference.module';
import { Clothing } from './entities/clothing.entity';
import { Outfit } from './entities/outfit.entity';
import { Preference } from './entities/preference.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'clothing.db',
      entities: [Clothing, Outfit, Preference],
      synchronize: true,
    }),
    ClothingModule,
    OutfitModule,
    PreferenceModule,
  ],
})
export class AppModule {}
