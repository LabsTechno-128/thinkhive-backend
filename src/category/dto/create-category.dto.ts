import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'image must be a valid URL' })
  image?: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
