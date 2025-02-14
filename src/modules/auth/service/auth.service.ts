import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientLoginProps } from '../interface/auth_interface';

@Injectable()
export class AuthService {
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
}
