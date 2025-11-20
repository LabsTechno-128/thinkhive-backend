import { Controller, Post, UploadedFile, UseInterceptors, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { Attachment } from './entities/attachment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Express } from 'express';

@ApiTags('attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: UploadFileDto,
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: Attachment })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ): Promise<Attachment> {
    return this.attachmentsService.uploadFile(file, folder);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Returns the attachment', type: Attachment })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async getFile(@Param('id') id: string): Promise<Attachment> {
    const attachment = await this.attachmentsService.findById(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }
    return attachment;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    const attachment = await this.attachmentsService.findById(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }
    await this.attachmentsService.deleteFile(attachment.publicId);
    return { message: 'File deleted successfully' };
  }
}
