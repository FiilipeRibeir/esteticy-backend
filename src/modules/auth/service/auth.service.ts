import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { ClientLoginProps } from '../interface/auth_interface';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async clientLogin(data: ClientLoginProps): Promise<{ access_token: string }> {
    const { email, phone } = data;

    const client = await this.prisma.client.findUnique({
      where: { email },
    });

    if (!client || client.phone !== phone) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: client.id, email: client.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(idToken: string): Promise<{ access_token: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: payload.email || '',
          name: payload.name || '',
          nickname: payload.given_name || '',
        },
      });
    }

    const jwtPayload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(jwtPayload) };
  }
}
