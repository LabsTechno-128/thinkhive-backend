import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EbooksService } from './ebooks.service';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { EbookResponseDto } from './dto/ebook-response.dto';

@ApiTags('ebooks')
@Controller('ebooks')
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new ebook' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ebook created successfully',
    type: EbookResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  create(@Body() createEbookDto: CreateEbookDto): Promise<EbookResponseDto> {
    return this.ebooksService.create(createEbookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ebooks with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of ebooks',
    type: [EbookResponseDto],
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    return this.ebooksService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single ebook by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the requested ebook',
    type: EbookResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ebook not found' })
  findOne(@Param('id') id: string) {
    return this.ebooksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing ebook' })
  @ApiResponse({
    status: 200,
    description: 'Ebook updated successfully',
    type: EbookResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ebook not found' })
  update(@Param('id') id: string, @Body() updateEbookDto: UpdateEbookDto) {
    return this.ebooksService.update(id, updateEbookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ebook' })
  @ApiResponse({ status: 200, description: 'Ebook deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ebook not found' })
  remove(@Param('id') id: string) {
    return this.ebooksService.remove(id);
  }
}
