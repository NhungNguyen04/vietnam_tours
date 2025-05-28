import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TourReviewService } from './tourReview.service';
import { CreateTourReviewInput, UpdateTourReviewInput } from '../../../schemas';

@Controller('tour-reviews')
export class TourReviewController {
  constructor(private readonly tourReviewService: TourReviewService) {}

  @Post()
  async createReview(
    @Body() createReviewDto: CreateTourReviewInput,
    @Query('userId') userId: string
  ) {
    return this.tourReviewService.createReview(userId, createReviewDto);
  }

  @Get('tour/:tourId')
  async getTourReviews(@Param('tourId') tourId: string) {
    return this.tourReviewService.getTourReviews(tourId);
  }

  @Get('user')
  async getUserReviews(@Query('userId') userId: string) {
    return this.tourReviewService.getUserReviews(userId);
  }

  @Get('tour/:tourId/rating')
  async getTourAverageRating(@Param('tourId') tourId: string) {
    return this.tourReviewService.getTourAverageRating(tourId);
  }

  @Get(':id')
  async getReview(@Param('id') id: string) {
    return this.tourReviewService.getReview(id);
  }

  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateTourReviewInput,
    @Query('userId') userId: string
  ) {
    return this.tourReviewService.updateReview(id, userId, updateReviewDto);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string, @Query('userId') userId: string) {
    return this.tourReviewService.deleteReview(id, userId);
  }
}
