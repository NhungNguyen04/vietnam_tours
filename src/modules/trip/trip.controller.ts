import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { Prisma } from '@prisma/client';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  async createTrip(@Body() data: Prisma.TripCreateInput) {
    return this.tripService.createTrip(data);
  }

  @Get()
  async findAllTrips(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const where: Prisma.TripWhereInput = {};
    
    if (locationId) {
      where.locationId = locationId;
    }
    
    if (startDate) {
      where.startDate = {
        gte: new Date(startDate),
      };
    }
    
    if (endDate) {
      where.endDate = {
        lte: new Date(endDate),
      };
    }
    
    return this.tripService.findAllTrips({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripService.findTripById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.TripUpdateInput,
  ) {
    return this.tripService.updateTrip(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tripService.deleteTrip(id);
  }

  // Trip participants endpoints
  @Post(':id/participants')
  async addParticipant(
    @Param('id') tripId: string,
    @Body() data: { userId: string },
  ) {
    return this.tripService.addParticipant(tripId, data.userId);
  }

  @Delete(':id/participants/:userId')
  async removeParticipant(
    @Param('id') tripId: string,
    @Param('userId') userId: string,
  ) {
    return this.tripService.removeParticipant(tripId, userId);
  }

  @Get(':id/participants')
  async getTripParticipants(@Param('id') tripId: string) {
    return this.tripService.findTripParticipants(tripId);
  }

  @Get('user/:userId')
  async getUserTrips(@Param('userId') userId: string) {
    return this.tripService.findUserTrips(userId);
  }
}
