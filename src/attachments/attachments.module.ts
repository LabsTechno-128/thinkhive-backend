import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { Attachment } from './entities/attachment.entity';
import { CloudinaryProvider } from '../config/cloudinary.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    ConfigModule,
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, CloudinaryProvider],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
