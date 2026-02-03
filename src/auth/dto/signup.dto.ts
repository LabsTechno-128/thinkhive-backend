import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';

// Custom validator to ensure at least email or phone exists
@ValidatorConstraint({ name: 'EmailOrPhone', async: false })
class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.email || obj.phone); // At least one should exist
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either email or phone must be provided.';
  }
}

export class SignupDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // Optional: validate at least one exists
  @Validate(EmailOrPhoneConstraint)
  dummyCheck?: any; // This property just triggers the custom validator
}
