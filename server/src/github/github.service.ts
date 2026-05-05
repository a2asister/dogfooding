import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubService {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly headers: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('GITHUB_API_BASE_URL', 'https://api.github.com');
    this.token = this.configService.get<string>('GITHUB_TOKEN', '');
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      ...(this.token && { Authorization: `token ${this.token}` }),
    };
  }

  async get(endpoint: string, params?: Record<string, any>): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headers,
          params,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint: string, data?: Record<string, any>): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${endpoint}`, data, {
          headers: this.headers,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(endpoint: string, data?: Record<string, any>): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}${endpoint}`, data, {
          headers: this.headers,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}${endpoint}`, {
          headers: this.headers,
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message || 'GitHub API 请求失败';
    throw new HttpException(message, status);
  }

  async getAuthenticatedUser(): Promise<any> {
    if (!this.token) {
      throw new HttpException('未配置 GitHub Token', HttpStatus.UNAUTHORIZED);
    }
    return this.get('/user');
  }

  async searchRepositories(query: string, page = 1, perPage = 30): Promise<any> {
    return this.get('/search/repositories', {
      q: query,
      page,
      per_page: perPage,
    });
  }
}
