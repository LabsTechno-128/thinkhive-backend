import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

type ValidFileType = 'ebook' | 'cover';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly validMimeTypes = {
    'application/pdf': '.pdf',
    'application/epub+zip': '.epub',
    'application/x-mobipocket-ebook': '.mobi',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };

  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  constructor(private readonly fileType: ValidFileType) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    const storage = diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = this.getUploadPath(this.fileType);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const fileExt = this.getFileExtension(file.mimetype);
        const filename = `${uuidv4()}${fileExt}`;
        cb(null, filename);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (!this.isValidMimeType(file.mimetype, this.fileType)) {
        return cb(
          new BadRequestException(
            `Invalid file type. ${this.getValidFileTypes(this.fileType)}`,
          ),
          false,
        );
      }
      cb(null, true);
    };

    const multerOptions = {
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
      },
    };

    // This is a simplified version - in a real implementation, you'd use multer here
    // For the interceptor pattern, we're just setting up the configuration
    req.fileUploadConfig = multerOptions;
    req.fileType = this.fileType;

    return next.handle();
  }

  private getUploadPath(fileType: ValidFileType): string {
    const basePath = process.cwd();
    return fileType === 'ebook'
      ? `${basePath}/uploads/ebooks`
      : `${basePath}/uploads/covers`;
  }

  private isValidMimeType(mimetype: string, fileType: ValidFileType): boolean {
    if (fileType === 'ebook') {
      return [
        'application/pdf',
        'application/epub+zip',
        'application/x-mobipocket-ebook',
      ].includes(mimetype);
    } else {
      return ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype);
    }
  }

  private getValidFileTypes(fileType: ValidFileType): string {
    return fileType === 'ebook'
      ? 'Only PDF, EPUB, and MOBI files are allowed.'
      : 'Only JPG, PNG, and WebP images are allowed.';
  }

  private getFileExtension(mimetype: string): string {
    return this.validMimeTypes[mimetype] || '';
  }
}
