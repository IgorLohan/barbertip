import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const userDoc = user as UserDocument;
    const { password: _, ...result } = userDoc.toObject();
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const userId = user._id?.toString() || (user as any).id?.toString() || '';
    const companyId = typeof user.companyId === 'object' 
      ? (user.companyId as any)._id?.toString() || user.companyId.toString()
      : user.companyId?.toString() || '';

    const payload: JwtPayload = {
      sub: userId,
      email: user.email,
      role: user.role,
      companyId: companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: companyId,
      },
    };
  }
}
