import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import dataSource from 'config/typeORM.config';
import { AttachmentsModule } from './attachments/attachments.module';
import { ArticlesModule } from './articles/articles.module';
import { EbooksModule } from './ebooks/ebooks.module';
import { QuizModule } from './quiz/quiz.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => dataSource(configService),
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    AttachmentsModule,
    ArticlesModule,
    EbooksModule,
    QuizModule,
    BannersModule,
  ],
})
export class AppModule { }
