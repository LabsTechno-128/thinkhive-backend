import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../entities/article.entity';

export class PaginatedArticlesDto {
  @ApiProperty({ type: [Article] })
  items: Article[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}
