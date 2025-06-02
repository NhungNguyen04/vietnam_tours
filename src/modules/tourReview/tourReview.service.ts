import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateTourReviewInput, UpdateTourReviewInput } from '../../../schemas';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class TourReviewService {
  constructor() {}

  async createReview(userId: string, dto: CreateTourReviewInput) {
    // Verify that the tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: dto.tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Check if user has already reviewed this tour
    const existingReview = await prisma.tourReview.findFirst({
      where: {
        userId,
        tourId: dto.tourId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this tour');
    }

    // Create the review
    return prisma.tourReview.create({
      data: {
        tourId: dto.tourId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async getTourReviews(tourId: string) {
    // Verify that the tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Get all reviews for the tour
    return prisma.tourReview.findMany({
      where: { tourId },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        }
      },
    });
  }

  async getUserReviews(userId: string) {
    return prisma.tourReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        }
      },
    });
  }

  async getReview(id: string) {
    const review = await prisma.tourReview.findUnique({
      where: { id },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async updateReview(id: string, userId: string, dto: UpdateTourReviewInput) {
    const review = await prisma.tourReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this review');
    }

    return prisma.tourReview.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async deleteReview(id: string, userId: string) {
    const review = await prisma.tourReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this review');
    }

    return prisma.tourReview.delete({
      where: { id },
    });
  }

  async getTourAverageRating(tourId: string) {
    const aggregations = await prisma.tourReview.aggregate({
      where: { tourId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
    
    return {
      averageRating: aggregations._avg.rating || 0,
      totalReviews: aggregations._count.rating || 0,
    };
  }
}
