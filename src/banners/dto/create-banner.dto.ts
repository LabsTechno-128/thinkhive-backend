import { IsString, IsUrl, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({
    description: 'URL of the banner image',
    required: false,
    nullable: true,
    example: 'https://example.com/banner.jpg',
  })
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsOptional()
  @MaxLength(500)
  image?: string | null;

  @ApiProperty({
    description: 'Title of the banner',
    required: false,
    nullable: true,
    example: 'Summer Sale',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string | null;

  @ApiProperty({
    description: 'Subtitle of the banner',
    required: false,
    nullable: true,
    example: 'Up to 50% off',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  subtitle?: string | null;

  @ApiProperty({
    description: 'Detailed description of the banner',
    required: false,
    nullable: true,
    example: 'Special summer sale with amazing discounts',
  })
  @IsString()
  @IsOptional()
  description?: string | null;
}
