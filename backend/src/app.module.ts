import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementModule } from './measurement/measurement.module';
import { ScaleParamsModule } from './scale-params/scale-params.module';
import { SizeTemplateModule } from './size-template/size-template.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'ruler.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MeasurementModule,
    ScaleParamsModule,
    SizeTemplateModule,
  ],
})
export class AppModule {}
