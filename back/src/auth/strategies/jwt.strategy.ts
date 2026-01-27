import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.active) {
      throw new UnauthorizedException();
    }
    const userDoc = user as UserDocument;
    const userId = userDoc._id?.toString() || (userDoc as any).id?.toString() || '';
    let companyId = '';
    const companyIdValue = userDoc.companyId;
    if (companyIdValue != null) {
      if (typeof companyIdValue === 'object' && companyIdValue !== null) {
        const objId = companyIdValue as any;
        companyId = objId._id?.toString() || objId.toString();
      } else {
        companyId = String(companyIdValue);
      }
    }

    return {
      id: userId,
      email: user.email,
      role: user.role,
      companyId: companyId,
    };
  }
}
