import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<string> {
    return await this.authService.signup(signupDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirect handled by passport
  }
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    if (!user) throw new Error('User not found');

    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    return res.redirect(
      `http://localhost:3000/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
