import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EbookResponseDto {
  @ApiProperty({ description: 'Unique identifier of the ebook' })
  id: string;

  @ApiPropertyOptional({ description: 'Title of the ebook' })
  title: string | null;

  @ApiPropertyOptional({ description: 'Description of the ebook' })
  description: string | null;

  @ApiPropertyOptional({ description: 'Author of the ebook' })
  author: string | null;

  @ApiPropertyOptional({ 
    description: 'Categories of the ebook',
    type: [String],
    example: ['Fiction', 'Science']
  })
  categories: string[] | null;

  @ApiPropertyOptional({ description: 'URL of the ebook file' })
  ebookFileUrl: string | null;

  @ApiPropertyOptional({ description: 'URL of the cover image' })
  coverImageUrl: string | null;

  @ApiPropertyOptional({ 
    description: 'Publication date of the ebook',
    type: 'string',
    format: 'date-time'
  })
  publishedAt: Date | null;

  @ApiProperty({ 
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time'
  })
  updatedAt: Date;

  constructor(partial: Partial<EbookResponseDto>) {
    Object.assign(this, partial);
  }
}
