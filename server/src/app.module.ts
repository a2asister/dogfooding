import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { FlowchartModule } from './flowchart/flowchart.module'
import { TemplateModule } from './template/template.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'flowchart.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true
    }),
    FlowchartModule,
    TemplateModule
  ]
})
export class AppModule {}
