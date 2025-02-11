import { Controller, Get, Query, Body, Res } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MercadopagoService } from '../service/mercadopago.service';
import { PrismaService } from '../../../prisma/prisma.service'; 
import { Response } from 'express'; 

@Controller('oauth')
export class MercadopagoController {
  constructor(
    private readonly oauthService: MercadopagoService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('redirect')
  async redirectToAuth(@Query('userId') userId: string, @Res() reply: Response) {
    try {
      if (!userId) {
        return reply.status(400).send({ error: 'Missing userId in request body' });
      }

      const state = randomUUID();
      const codeVerifier = this.oauthService.generateCodeVerifier();
      const codeChallenge = await this.oauthService.generateCodeChallenge(codeVerifier);

      await this.prismaService.mercadoPagoSession.create({
        data: {
          userId,
          state,
          codeVerifier,
        },
      });

      const authUrl = this.oauthService.getAuthUrl(state, codeChallenge);

      return reply.status(200).send({ authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      return reply.status(500).send({ error: 'Failed to generate auth URL' });
    }
  }

  @Get('callback')
  async handleCallback(@Query() query: { code: string; state: string }, @Res() reply: Response) {
    try {
      const { code, state } = query;

      if (!code || !state) {
        return reply.status(400).send({ error: 'Missing code or state in query parameters' });
      }

      const session = await this.prismaService.mercadoPagoSession.findUnique({
        where: { state },
      });

      if (!session) {
        return reply.status(404).send({ error: 'Session not found for the given state' });
      }

      const tokenResponse = await this.oauthService.getAccessToken(code, session.codeVerifier);

      await this.prismaService.mercadoPagoToken.create({
        data: {
          userId: session.userId,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });

      await this.prismaService.mercadoPagoSession.delete({
        where: { state },
      });

      return reply.status(200).send(tokenResponse);
    } catch (error) {
      console.error('Error handling callback:', error.message);
      return reply.status(500).send({ error: 'Failed to handle callback' });
    }
  }

  @Get('refresh')
  async refreshAccessToken(@Body() body: { userId: string }, @Res() reply: Response) {
    try {
      const { userId } = body;

      if (!userId) {
        return reply.status(400).send({ error: 'Missing userId in request body' });
      }

      const userToken = await this.prismaService.mercadoPagoToken.findUnique({ where: { userId } });

      if (!userToken || !userToken.refreshToken) {
        return reply.status(404).send({ error: 'User token or refresh token not found' });
      }

      const tokenResponse = await this.oauthService.refreshAccessToken(userToken.refreshToken);

      await this.prismaService.mercadoPagoToken.update({
        where: { userId },
        data: {
          accessToken: tokenResponse.access_token,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        },
      });

      return reply.status(200).send(tokenResponse);
    } catch (error) {
      console.error('Error refreshing access token:', error.message);
      return reply.status(500).send({ error: 'Failed to refresh access token' });
    }
  }
}
