import {
  BadRequestException,
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
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) { }

  async signup(signupDto: SignupDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: Partial<User>;
  }> {
    const { name, email, phone, password } = signupDto;

    // Check if email or phone already exists
    if (email) {
      const emailExists = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExists) throw new BadRequestException('Email already registered');
    }

    if (phone) {
      const phoneExists = await this.userRepository.findOne({
        where: { phone },
      });
      if (phoneExists) throw new BadRequestException('Phone already registered');
    }

    // Hash password
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userRepository.save({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const tokens = await this.generateTokens(user);

    return { ...tokens, user };
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: Partial<User>;
  }> {
    const { email, phone, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where(email ? 'user.email = :email' : 'user.phone = :phone', {
        email,
        phone,
      })
      .getOne();

    if (!user) throw new NotFoundException('User not found');
    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }
    if (!user.password) {
      throw new UnauthorizedException('Please login using social login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);

    // Remove password from response
    (user as any).password = undefined;

    return { ...tokens, user };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Check if token exists in DB and is not revoked
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, revoked: false },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      // Revoke old token
      storedToken.revoked = true;
      await this.refreshTokenRepository.save(storedToken);

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
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

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Store refresh token in DB
    await this.refreshTokenRepository.save({
      token: refreshToken,
      userId: user.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 60 * 60, // seconds in 1 hour
    };
  }
}
