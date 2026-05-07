import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: Error, user: any, info: Error): any {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expirado');
    }

    if (info?.name === 'JsonWebTokenError') {
      throw new UnauthorizedException('Token inválido');
    }

    if (err || !user) {
      throw new UnauthorizedException('No autorizado');
    }

    return user;
  }
}
