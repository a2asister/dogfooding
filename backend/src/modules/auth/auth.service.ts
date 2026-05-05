import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private cryptoService: CryptoService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, privateKey: __, ...safeUser } = user;
    return safeUser;
  }

  async logout(session: any) {
    return new Promise((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  getCurrentUser(session: any) {
    if (!session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    return session.userId;
  }
}
