import { BadRequestException, Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ClientLoginSchema } from '../interface/auth_interface';
import { AuthService } from '../service/auth.service';

@Controller('oauth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('client')
  async clientLogin(@Body() data: unknown) {
    const parsedData = ClientLoginSchema.safeParse(data);

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    return this.authService.clientLogin(parsedData.data);
  }
}
