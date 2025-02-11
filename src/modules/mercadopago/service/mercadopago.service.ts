import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MercadopagoService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.MERCADO_PAGO_CLIENT_ID!;
    this.clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET!;
    this.redirectUri = process.env.MERCADO_PAGO_REDIRECT_URI!;
    this.baseUrl = 'https://api.mercadopago.com';
  }

  generateCodeVerifier(): string {
    return crypto.randomBytes(64).toString('base64url');
  }

  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64');
    return hash.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  getAuthUrl(state: string, codeChallenge: string): string {
    return `https://auth.mercadopago.com/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  }

  async getAccessToken(authorizationCode: string, codeVerifier: string): Promise<any> {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: authorizationCode,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log('Access token refreshed successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
      throw error;
    }
  }
}
