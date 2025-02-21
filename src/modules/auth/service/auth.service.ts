import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientLoginProps, UserLoginProps } from '../interface/auth_interface';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

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

  async UserLogin(data: UserLoginProps): Promise<{ access_token: string }> {
    const { idToken } = data;

    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      const { data: authData, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error("Erro ao autenticar com o idToken:", error);
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (!authData?.user) {
        console.error("Nenhum usuário retornado:", authData);
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const { user } = authData;

      const payload = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
      };
    } catch (err) {
      console.error("Erro inesperado:", err);
      throw new UnauthorizedException('Erro ao processar login');
    }
  }
}