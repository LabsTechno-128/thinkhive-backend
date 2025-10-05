import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { SocialUserDto } from './dto/social.user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return this.authRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
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
