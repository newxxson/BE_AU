import { HttpException, Injectable } from '@nestjs/common';
import { ConfigFactory, ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/repository/user.repository';

@Injectable()
export class AuthService {
  private SIGNUP_TOKEN_SECRET: string;
  private accessSecret: string;
  private refreshSecret: string;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userRepo: UserRepository,
  ) {
    this.accessSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    this.refreshSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    this.SIGNUP_TOKEN_SECRET = configService.get<string>('SIGNUP_TOKEN_SECRET');
  }

  async signToken(mode: string, payload: any): Promise<string> {
    let token: string;

    if (mode == 'access') {
      token = await this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: '1h',
      });
    } else if (mode == 'refresh') {
      token = await this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: '30d',
      });
    } else if (mode == 'signup') {
      token = await this.jwtService.signAsync(payload, {
        secret: this.SIGNUP_TOKEN_SECRET,
        expiresIn: '1h',
      });
    }
    if (!token) {
      const err = mode + ' error';
      console.log(err);
      throw new Error(err);
    }
    return token;
  }

  async verifyToken(mode: string, token: string) {
    let secret: string;
    if (mode == 'access') secret = this.accessSecret;
    else if (mode == 'refresh') secret = this.refreshSecret;
    else if (mode == 'signup') secret = this.SIGNUP_TOKEN_SECRET;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      return payload;
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new HttpException('invalid token', 401);
      }
    }
  }
  async getUser(userId: string) {
    // get user from db
    const user = await this.userRepo.findById(userId);
    return user;
  }
}
