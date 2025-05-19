import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { AgencyRegisterDto, AgencyLoginDto } from './dto/agency-auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post('register')
  async register(@Body() registerDto: AgencyRegisterDto) {
    return this.agencyService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: AgencyLoginDto) {
    return this.agencyService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENCY')
  async getProfile(@Req() req) {
    const agencyId = req.user.sub;
    return this.agencyService.getAgencyById(agencyId);
  }
}
