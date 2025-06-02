import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AgencyRegisterDto, AgencyLoginDto } from './dto/agency-auth.dto';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class AgencyService {
  constructor(
    private jwtService: JwtService,
  ) {}

  async register(dto: AgencyRegisterDto) {
    // Check if agency with email already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { email: dto.email },
    });

    if (existingAgency) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create new agency
    const agency = await prisma.agency.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.generateToken(agency.id);

    // Return agency without password and token
    const { password, ...agencyWithoutPassword } = agency;
    return {
      agency: agencyWithoutPassword,
      token,
    };
  }

  async login(dto: AgencyLoginDto) {
    // Find agency by email
    const agency = await prisma.agency.findUnique({
      where: { email: dto.email },
    });

    // If agency not found or password doesn't match
    if (!agency) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, agency.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(agency.id);

    // Return agency without password and token
    const { password, ...agencyWithoutPassword } = agency;
    return {
      agency: agencyWithoutPassword,
      token,
    };
  }

  private generateToken(agencyId: string): string {
    const payload = { sub: agencyId, role: 'AGENCY' };
    return this.jwtService.sign(payload);
  }

  async getAgencyById(id: string) {
    const agency = await prisma.agency.findUnique({
      where: { id },
    });

    if (!agency) {
      return null;
    }

    // Return agency without password
    const { password, ...agencyWithoutPassword } = agency;
    return agencyWithoutPassword;
  }
}
