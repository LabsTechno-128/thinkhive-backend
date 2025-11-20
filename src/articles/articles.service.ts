import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginatedArticlesDto } from './dto/paginated-articles.dto';

type FindAllOptions = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  isPublished?: boolean;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    try {
      const article = this.articlesRepository.create({
        ...createArticleDto,
        createdDate: createArticleDto.createdDate || new Date(),
        updatedDate: new Date(),
      });
      return await this.articlesRepository.save(article);
    } catch (error) {
      throw new BadRequestException('Failed to create article');
    }
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    category,
    author,
    isPublished,
  }: FindAllOptions = {}): Promise<PaginatedArticlesDto> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.title = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    if (author) {
      where.author = author;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [items, total] = await this.articlesRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);
    
    const updatedArticle = this.articlesRepository.merge(article, {
      ...updateArticleDto,
      updatedDate: new Date(),
    });

    return this.articlesRepository.save(updatedArticle);
  }

  async remove(id: string): Promise<void> {
    const result = await this.articlesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.articlesRepository
      .createQueryBuilder('article')
      .select('DISTINCT article.category', 'category')
      .where('article.category IS NOT NULL')
      .getRawMany();

    return categories.map((item) => item.category);
  }

  async getPublishedArticles({
    page = 1,
    limit = 10,
    category,
    search,
  }: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}): Promise<PaginatedArticlesDto> {
    return this.findAll({
      page,
      limit,
      isPublished: true,
      category,
      search,
    });
  }
}
