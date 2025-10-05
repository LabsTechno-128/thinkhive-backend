import { IsEmail, IsString, ValidateIf } from 'class-validator';

export class LoginDto {
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @IsString({ message: 'Password is required' })
  password: string;
}
