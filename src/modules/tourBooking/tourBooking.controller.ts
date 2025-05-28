import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TourBookingService } from './tourBooking.service';
import { CreateTourBookingInput, UpdateTourBookingInput } from '../../../schemas';

@Controller('tour-bookings')
export class TourBookingController {
  constructor(private readonly tourBookingService: TourBookingService) {}

  @Post()
  async createBooking(
    @Body() createBookingDto: CreateTourBookingInput,
    @Query('userId') userId: string
  ) {
    return this.tourBookingService.createBooking(userId, createBookingDto);
  }

  @Get()
  async getUserBookings(@Query('userId') userId: string) {
    return this.tourBookingService.getUserBookings(userId);
  }

  @Get(':id')
  async getBooking(@Param('id') id: string, @Query('userId') userId: string) {
    return this.tourBookingService.getBookingById(id, userId);
  }

  @Patch(':id')
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateTourBookingInput,
    @Query('userId') userId: string
  ) {
    return this.tourBookingService.updateBooking(id, userId, updateBookingDto);
  }

  @Delete(':id')
  async cancelBooking(@Param('id') id: string, @Query('userId') userId: string) {
    return this.tourBookingService.cancelBooking(id, userId);
  }

  @Patch(':id/update-status')
  async updateBookingStatus(
    @Param('id') id: string,
  ) {
    return this.tourBookingService.updateBookingStatus(id);
  }

  @Get('tour/:tourId')
  async getTourBookings(@Param('tourId') tourId: string) {
    return this.tourBookingService.getTourBookings(tourId);
  }
}
