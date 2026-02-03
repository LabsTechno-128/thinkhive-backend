import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question } from './entities/question.entity';
import { Option } from './entities/option.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const { questions, ...quizData } = createQuizDto;
    
    const quiz = this.quizRepository.create(quizData);
    const savedQuiz = await this.quizRepository.save(quiz);

    if (questions && questions.length > 0) {
      await this.addQuestionsToQuiz(savedQuiz.id, questions);
    }

    return this.findOne(savedQuiz.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    includeRelations: boolean = false,
  ): Promise<{ data: Quiz[]; total: number }> {
    const [data, total] = await this.quizRepository.findAndCount({
      relations: includeRelations ? ['questions', 'questions.options'] : [],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      withDeleted: false,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
      withDeleted: false,
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);
    
    if (updateQuizDto.questions) {
      // Remove existing questions and options
      await this.removeQuestions(quiz.id);
      
      // Add new questions
      await this.addQuestionsToQuiz(quiz.id, updateQuizDto.questions);
      
      // Remove questions from DTO to avoid updating them directly
      const { questions, ...updateData } = updateQuizDto;
      
      // Only update if there are other fields to update
      if (Object.keys(updateData).length > 0) {
        await this.quizRepository.update(id, updateData as any);
      }
    } else {
      await this.quizRepository.update(id, updateQuizDto as any);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
  }

  private async addQuestionsToQuiz(quizId: string, questions: any[]): Promise<void> {
    for (const questionData of questions) {
      const { options, ...questionProps } = questionData;
      
      const question = this.questionRepository.create({
        ...questionProps,
        quizId,
      });
      
      // Save the question and get the saved entity
      const savedQuestion = await this.questionRepository.save(question);

      if (options && Array.isArray(options) && options.length > 0) {
        // Assert that savedQuestion has an id property
        await this.addOptionsToQuestion((savedQuestion as any).id, options);
      }
    }
  }

  private async addOptionsToQuestion(questionId: string, options: any[]): Promise<void> {
    const optionsToSave = options.map(option => ({
      ...option,
      questionId,
    }));

    await this.optionRepository.save(optionsToSave);
  }

  private async removeQuestions(quizId: string): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { quizId },
      select: ['id'],
    });
    
    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      
      // Delete options first
      await this.optionRepository
        .createQueryBuilder()
        .delete()
        .where('questionId IN (:...ids)', { ids: questionIds })
        .execute();
      
      // Then delete questions
      await this.questionRepository
        .createQueryBuilder()
        .delete()
        .where('id IN (:...ids)', { ids: questionIds })
        .execute();
    }
  }
}
