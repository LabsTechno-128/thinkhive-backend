import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateEbookDto {
  @ApiPropertyOptional({ description: 'Title of the ebook' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the ebook' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Author of the ebook' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ 
    description: 'Categories of the ebook',
    type: [String],
    example: ['Fiction', 'Science']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({ 
    description: 'URL of the ebook file (handled by file upload)',
    readOnly: true
  })
  @IsString()
  @IsOptional()
  ebookFileUrl?: string;

  @ApiPropertyOptional({ 
    description: 'URL of the cover image (handled by file upload)',
    readOnly: true
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Publication date of the ebook (ISO 8601 format)',
    example: '2023-01-01T00:00:00.000Z'
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: Date;
}
