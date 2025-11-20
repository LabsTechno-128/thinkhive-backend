import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindManyOptions } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PaginatedBannersDto } from './dto/paginated-banners.dto';
// Import Multer types
declare module 'express' {
  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
}

type MulterFile = Express.Multer.File;

interface FindAllBannersOptions {
  page?: number;
  limit?: number;
  search?: string;
  withDeleted?: boolean;
}

interface UploadResult {
  url: string;
}

/**
 * Interface for paginated results
 */
interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Service responsible for handling banner-related operations
 */
@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  /**
   * Create a new banner
   * @param createBannerDto Banner data to create
   * @returns Created banner
   * @throws ConflictException if a banner with similar details already exists
   * @throws InternalServerErrorException if an unexpected error occurs
   */
  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    try {
      this.logger.log('Creating a new banner');
      const banner = this.bannersRepository.create({
        ...createBannerDto,
        isDeleted: false,
      });
      
      const savedBanner = await this.bannersRepository.save(banner);
      this.logger.log(`Banner created with ID: ${savedBanner.id}`);
      
      return savedBanner;
    } catch (error) {
      this.logger.error(`Error creating banner: ${error.message}`, error.stack);
      
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException('Banner with similar details already exists');
      }
      
      throw new InternalServerErrorException('Failed to create banner');
    }
  }

  /**
   * Retrieves all banners with pagination and filtering
   * @param options - Pagination and filtering options
   * @returns Paginated list of banners
   */
  async findAll({
    page = 1,
    limit = 10,
    search,
  }: FindAllBannersOptions = {}): Promise<PaginatedBannersDto> {
    try {
      this.logger.log(`Fetching banners - Page: ${page}, Limit: ${limit}`);
      
      const skip = (page - 1) * limit;
      const where: any = {};
      
      if (search) {
        where.title = Like(`%${search}%`);
      }

      const [data, total] = await this.bannersRepository.findAndCount({
        where,
        withDeleted: false,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      
      const result = new PaginatedBannersDto();
      result.data = data;
      result.total = total;
      result.page = page;
      result.limit = limit;
      result.totalPages = totalPages;
      result.hasNextPage = page < totalPages;
      result.hasPreviousPage = page > 1;
      
      return result;
    } catch (error) {
      this.logger.error(`Error fetching banners: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch banners');
    }
  }

  /**
   * Finds a banner by ID
   * @param id - The ID of the banner to find
   * @param withDeleted - Whether to include soft-deleted banners
   * @returns The found banner
   * @throws NotFoundException if the banner is not found
   */
  async findOne(id: string, withDeleted = false): Promise<Banner> {
    try {
      this.logger.log(`Finding banner with ID: ${id}`);
      
      const where: FindOptionsWhere<Banner> = { id };
      if (!withDeleted) {
        where.isDeleted = false;
      }
      
      const banner = await this.bannersRepository.findOne({
        where,
        withDeleted,
      });

      if (!banner) {
        this.logger.warn(`Banner with ID ${id} not found`);
        throw new NotFoundException(`Banner with ID ${id} not found`);
      }

      return banner;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error finding banner ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve banner');
    }
  }

  /**
   * Updates a banner
   * @param id - The ID of the banner to update
   * @param updateBannerDto - The data to update the banner with
   * @returns The updated banner
   * @throws NotFoundException if the banner is not found
   * @throws BadRequestException if trying to update a deleted banner
   */
  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    try {
      this.logger.log(`Updating banner with ID: ${id}`);
      
      const banner = await this.bannersRepository.preload({
        id,
        ...updateBannerDto,
      });
      
      if (!banner) {
        throw new NotFoundException(`Banner with ID ${id} not found`);
      }
      
      banner.updatedAt = new Date();
      
      const savedBanner = await this.bannersRepository.save(banner);
      this.logger.log(`Banner with ID ${id} updated successfully`);
      
      return savedBanner;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error updating banner ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update banner');
    }
  }

  /**
   * Soft deletes a banner
   * @param id - The ID of the banner to delete
   * @throws NotFoundException if the banner is not found
   * @throws BadRequestException if the banner is already deleted
   */
  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Soft deleting banner with ID: ${id}`);
      
      const result = await this.bannersRepository.softDelete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Banner with ID ${id} not found`);
      }
      
      this.logger.log(`Banner with ID ${id} soft deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error deleting banner ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete banner');
    }
  }

  /**
   * Uploads a banner image
   * @param file - The uploaded file
   * @returns Object containing the URL of the uploaded image
   */
  async uploadImage(file: MulterFile): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      this.logger.log(`Uploading file: ${file.originalname}`);
      
      // In a real application, you would upload the file to a storage service here
      // For example, using AWS S3, Google Cloud Storage, or a similar service
      // This is a mock implementation that returns a placeholder URL
      
      const imageUrl = `https://example.com/uploads/${Date.now()}-${file.originalname}`;
      
      this.logger.log(`File uploaded successfully: ${imageUrl}`);
      
      return { url: imageUrl };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Restores a soft-deleted banner
   * @param id - The ID of the banner to restore
   * @returns The restored banner
   * @throws NotFoundException if the banner is not found or already active
   */
  async restore(id: string): Promise<Banner> {
    try {
      this.logger.log(`Restoring banner with ID: ${id}`);
      
      const result = await this.bannersRepository.restore(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Banner with ID ${id} not found or already active`);
      }
      
      const restoredBanner = await this.findOne(id, true);
      this.logger.log(`Banner with ID ${id} restored successfully`);
      
      return restoredBanner;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Error restoring banner ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to restore banner');
    }
  }
}
