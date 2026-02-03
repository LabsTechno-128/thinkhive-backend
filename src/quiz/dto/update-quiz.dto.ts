import { PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
  // All fields are optional due to PartialType
  // Add any update-specific validations or properties here if needed
  // For example, you might want to make some fields required on update
}
