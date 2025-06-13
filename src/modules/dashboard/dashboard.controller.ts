/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('users/monthly')
  async getUsersMonthlyStats(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getUsersMonthlyStats(yearNum);
  }

  @Get('tours/monthly')
  async getToursMonthlyStats(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getToursMonthlyStats(yearNum);
  }

  @Get('bookings/monthly')
  async getBookingsMonthlyStats(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getBookingsMonthlyStats(yearNum);
  }

  @Get('revenue/monthly')
  async getRevenueMonthlyStats(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getRevenueMonthlyStats(yearNum);
  }

  @Get('locations/by-category')
  async getLocationsByCategory() {
    return this.dashboardService.getLocationsByCategory();
  }

  @Get('top-locations')
  async getTopLocations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.dashboardService.getTopLocations(limitNum);
  }

  @Get('recent-activities')
  async getRecentActivities(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.dashboardService.getRecentActivities(limitNum);
  }
}