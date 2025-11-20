import { ApiProperty } from '@nestjs/swagger';
import { Banner } from '../entities/banner.entity';

export class PaginatedBannersDto {
  @ApiProperty({ type: [Banner] })
  data: Banner[];

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
