import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Option } from '../entities/option.entity';

export type QuizWithRelations = Quiz & {
  questions?: (Question & { options?: Option[] })[];
};

export type QuestionWithRelations = Question & {
  quiz?: Quiz;
  options?: Option[];
};

export type OptionWithRelations = Option & {
  question?: Question;
};
