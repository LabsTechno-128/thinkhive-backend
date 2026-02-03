import { PartialType } from '@nestjs/swagger';
import { CreateEbookDto } from './create-ebook.dto';

export class UpdateEbookDto extends PartialType(CreateEbookDto) {
  // All properties are inherited from CreateEbookDto but made optional by PartialType
  // Additional update-specific validations or properties can be added here if needed
}
