import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  createdDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  updatedDate?: Date;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  readingTime?: number;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;
}
