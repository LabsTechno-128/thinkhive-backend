import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Banner } from './entities/banner.entity';
import { PaginatedBannersDto } from '../banners/dto/paginated-banners.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiResponse({ status: 201, description: 'The banner has been successfully created.', type: Banner })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
    return await this.bannersService.create(createBannerDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload banner image' })
  @ApiResponse({ status: 201, description: 'The image has been successfully uploaded.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.bannersService.uploadImage(file);
      return { url: result.url };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload image');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all banners with pagination.', type: PaginatedBannersDto })
  @Get()
  @ApiOperation({ summary: 'Get all banners with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Return all banners with pagination.', type: PaginatedBannersDto })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedBannersDto> {
    const result = await this.bannersService.findAll({ 
      page: Number(page), 
      limit: Number(limit), 
      search 
    });
    
    const response = new PaginatedBannersDto();
    response.data = result.data;
    response.total = result.total;
    response.page = result.page;
    response.limit = result.limit;
    response.totalPages = result.totalPages;
    response.hasNextPage = result.hasNextPage;
    response.hasPreviousPage = result.hasPreviousPage;
    
    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a banner by ID' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Return the banner.', type: Banner })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async findOne(@Param('id') id: string): Promise<Banner> {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a banner' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'The banner has been successfully updated.', type: Banner })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a banner (soft delete)' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'The banner has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.bannersService.remove(id);
  }
}
