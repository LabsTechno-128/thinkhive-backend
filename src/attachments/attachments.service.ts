import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Attachment } from './entities/attachment.entity';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {}

  async uploadFile(file: Express.Multer.File, folder?: string): Promise<Attachment> {
    if (!file) {
      throw new Error('No file provided');
    }

    try {
      console.log('Uploading file:', file.originalname);
      
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder || 'attachments',
            resource_type: 'auto',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(error);
            }
            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      const attachment = new Attachment();
      attachment.publicId = result.public_id;
      attachment.url = result.url;
      attachment.secureUrl = result.secure_url;
      attachment.format = result.format;
      attachment.width = result.width;
      attachment.height = result.height;
      attachment.bytes = result.bytes;
      
      // Determine file type
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(result.format)) {
        attachment.type = 'image';
      } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(result.format)) {
        attachment.type = 'document';
      } else if (['mp4', 'webm', 'mov', 'avi'].includes(result.format)) {
        attachment.type = 'video';
      } else if (['mp3', 'wav', 'ogg'].includes(result.format)) {
        attachment.type = 'audio';
      } else {
        attachment.type = 'other';
      }

      return this.attachmentsRepository.save(attachment);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      await this.attachmentsRepository.delete({ publicId });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.attachmentsRepository.findOne({ where: { id } });
  }
}
