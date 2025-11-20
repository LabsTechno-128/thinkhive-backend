import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SocialUserDto } from './dto/social.user.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  findAll() {
    return this.userRepository.find();
  }
  async signup(signupDto: SignupDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const { email, phone, password } = signupDto;

    // Check if email or phone already exists
    if (email) {
      const emailExists = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExists) throw new NotFoundException('Email already registered');
    }

    if (phone) {
      const phoneExists = await this.userRepository.findOne({
        where: { phone },
      });
      if (phoneExists) throw new NotFoundException('Phone already registered');
    }

    // Hash password
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      phone,
    });

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { email, phone, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // এখানে password select করছি
      .where(email ? 'user.email = :email' : 'user.phone = :phone', {
        email,
        phone,
      })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    if (!user.password) {
      throw new UnauthorizedException('Please login using social login');
    }
    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  // validate social auth user
  async validateSocialUser(socialUser: SocialUserDto): Promise<User> {
    try {
      const { email, provider, accessToken, refreshToken, id, avatar, name } =
        socialUser;

      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['refreshTokens'],
      });

      if (user) {
        // Update existing user
        user[`${provider}Id`] = id;
        user.tokens = { accessToken, refreshToken };
        user.avatar = avatar;
        user.name = name;

        const updatedUser = await this.userRepository.save(user);
        return updatedUser;
      }

      // Create new user
      const newUser = this.userRepository.create({
        email,
        [`${provider}Id`]: id,
        tokens: { accessToken, refreshToken },
        avatar,
        name,
        availToSetPassword: true,
      });

      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } catch (error) {
      console.error('Error in validateSocialUser:', error);
      throw error;
    }
  }
  // token create
  async generateTokens(user: User) {
    const payload = {
      email: user.email,
      phone: user.phone,
      sub: user.id,
      roles: user.roles,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
      expiresIn: 60 * 60, // seconds in 1 hour
    };
  }
}
