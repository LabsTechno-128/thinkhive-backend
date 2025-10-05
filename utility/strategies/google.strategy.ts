import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GooglePassportStrategy } from 'passport-google-oauth20';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GooglePassportStrategy,
  'google',
) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<User> {
    const { emails, photos, displayName } = profile;

    const user = await this.authService.validateSocialUser({
      email: emails[0].value,
      name: displayName,
      avatar: photos[0].value,
      accessToken,
      refreshToken,
      provider: 'google',
      id: profile.id,
    });

    return user; // এখানে অবশ্যই আমাদের User entity return হচ্ছে
  }
}
