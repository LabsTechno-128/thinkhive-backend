import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) { }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const parent = dto.parent_id
      ? await this.categoryRepo.findOne({
        where: { id: dto.parent_id },
      })
      : undefined;
    const category = this.categoryRepo.create({
      ...dto,
      ...(parent && { parent }),
    });
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<{ data: Category[]; message: string }> {
    return {
      data: await this.categoryRepo.find({ relations: ['parent', 'children'] }),
      message: 'Categories retrieved successfully',
    };
  }

  async findOne(id: string): Promise<{ data: Category; message: string }> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return { data: category, message: 'Category found' };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category.data);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category.data);
  }
}
