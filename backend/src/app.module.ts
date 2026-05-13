import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { BuildingModule } from './building/building.module';
import { FloorModule } from './floor/floor.module';
import { HouseTypeModule } from './house-type/house-type.module';
import { HouseModule } from './house/house.module';
import { ReservationModule } from './reservation/reservation.module';
import { BrowseRecordModule } from './browse-record/browse-record.module';
import { Building } from './entities/building.entity';
import { Floor } from './entities/floor.entity';
import { HouseType } from './entities/house-type.entity';
import { House } from './entities/house.entity';
import { Reservation } from './entities/reservation.entity';
import { BrowseRecord } from './entities/browse-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Building, Floor, HouseType, House, Reservation, BrowseRecord],
      synchronize: true,
      logging: false,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    BuildingModule,
    FloorModule,
    HouseTypeModule,
    HouseModule,
    ReservationModule,
    BrowseRecordModule,
  ],
})
export class AppModule {}
