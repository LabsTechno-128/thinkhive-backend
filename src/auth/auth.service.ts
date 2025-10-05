import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SocialUserDto } from './dto/social.user.dto';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  findAll() {
    return this.userRepository.find();
  }
  async signup(signupDto: SignupDto): Promise<string> {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      phone,
    });

    const tokens = await this.generateTokens(user);

    return tokens.accessToken;
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
