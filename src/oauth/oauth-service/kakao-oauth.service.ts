import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { request } from 'http';
import { IOauth } from './ioauth.interface';
import { OauthDTO } from '../dto/oauth.dto';

@Injectable()
export class KakaoOauthService implements IOauth {
  private KAKAO_CLIENT_ID: string;
  private REDIRECT_URI: string;
  private KAKAO_CLIENT_SECRET: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.KAKAO_CLIENT_ID = this.configService.get<string>('KAKAO_CLIENT_ID');
    this.REDIRECT_URI = `${this.configService.get<string>('BACKEND_URL')}/oauth/kakao`;
    this.KAKAO_CLIENT_SECRET = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET',
    );
  }

  async getAccessToken(code: string): Promise<string> {
    const KAKAO_URL = 'https://kauth.kakao.com/oauth/token';
    const body = {
      grant_type: 'authorization_code',
      client_id: this.KAKAO_CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      code: code,
      client_secret: this.KAKAO_CLIENT_SECRET,
    };

    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const response = await firstValueFrom(
      this.httpService.post(KAKAO_URL, body, { headers: header }),
    );

    const { access_token, refresh_token } = response.data;

    return access_token;
  }

  async getUserInfo(code: string): Promise<OauthDTO> {
    const access_token = await this.getAccessToken(code);
    console.log('access_token obtained', access_token);
    const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me';
    const header = {
      Authorization: `Bearer ${access_token}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const response = await firstValueFrom(
      this.httpService.get(KAKAO_USER_URL, { headers: header }),
    );

    console.log(response.data);

    const { id, kakao_account } = response.data;
    const userInfo = new OauthDTO(id);
    return userInfo;
  }
}
