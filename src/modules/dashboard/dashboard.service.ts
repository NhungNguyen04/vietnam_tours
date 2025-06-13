/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Category, BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalTours,
      totalBookings,
      totalRevenue,
      totalLocations,
      totalBlogs,
      pendingBookings,
      confirmedBookings,
      activeAgencies,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.tour.count(),
      this.prisma.tourBooking.count(),
      this.prisma.tourBooking.aggregate({
        _sum: {
          totalPrice: true,
        },
      }),
      this.prisma.location.count(),
      this.prisma.blog.count(),
      this.prisma.tourBooking.count({
        where: { status: BookingStatus.PENDING },
      }),
      this.prisma.tourBooking.count({
        where: { status: BookingStatus.CONFIRMED },
      }),
      this.prisma.agency.count({
        where: { verified: true },
      }),
    ]);

    return {
      totalUsers,
      totalTours,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalLocations,
      totalBlogs,
      pendingBookings,
      confirmedBookings,
      activeAgencies,
    };
  }

  async getUsersMonthlyStats(year: number) {
    const monthlyStats = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _count: {
        id: true,
      },
    });

    // Initialize all months with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      count: 0,
    }));

    // Fill in actual data
    monthlyStats.forEach((stat) => {
      const month = stat.createdAt.getMonth();
      monthlyData[month].count += stat._count.id;
    });

    return monthlyData;
  }

  async getToursMonthlyStats(year: number) {
    const monthlyStats = await this.prisma.tour.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _count: {
        id: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      count: 0,
    }));

    monthlyStats.forEach((stat) => {
      const month = stat.createdAt.getMonth();
      monthlyData[month].count += stat._count.id;
    });

    return monthlyData;
  }

  async getBookingsMonthlyStats(year: number) {
    const monthlyStats = await this.prisma.tourBooking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      _count: {
        id: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      count: 0,
    }));

    monthlyStats.forEach((stat) => {
      const month = stat.createdAt.getMonth();
      monthlyData[month].count += stat._count.id;
    });

    return monthlyData;
  }

  async getRevenueMonthlyStats(year: number) {
    const monthlyRevenue = await this.prisma.tourBooking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2023, i).toLocaleString('default', { month: 'short' }),
      revenue: 0,
    }));

    monthlyRevenue.forEach((stat) => {
      const month = stat.createdAt.getMonth();
      monthlyData[month].revenue += stat._sum.totalPrice || 0;
    });

    return monthlyData;
  }

  async getLocationsByCategory() {
    const categoryCounts = await this.prisma.location.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    return categoryCounts.map((item) => ({
      category: item.category,
      count: item._count.id,
    }));
  }

  async getTopLocations(limit: number) {
    const topLocations = await this.prisma.location.findMany({
      select: {
        id: true,
        name: true,
        province: true,
        category: true,
        _count: {
          select: {
            favorites: true,
            trips: true,
            tours: true,
          },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return topLocations.map((location) => ({
      ...location,
      totalEngagement:
        location._count.favorites +
        location._count.trips +
        location._count.tours,
    }));
  }

  async getRecentActivities(limit: number) {
    const [recentUsers, recentBookings, recentBlogs, recentTours] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.tourBooking.findMany({
        select: {
          id: true,
          totalPrice: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
          tour: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.blog.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.tour.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          createdAt: true,
          agency: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        id: user.id,
        type: 'user_registration',
        title: `New user registered: ${user.name}`,
        description: user.email,
        createdAt: user.createdAt,
      })),
      ...recentBookings.map((booking) => ({
        id: booking.id,
        type: 'tour_booking',
        title: `New booking: ${booking.tour.title}`,
        description: `${booking.user.name} - $${booking.totalPrice}`,
        createdAt: booking.createdAt,
      })),
      ...recentBlogs.map((blog) => ({
        id: blog.id,
        type: 'blog_post',
        title: `New blog post: ${blog.title}`,
        description: `By ${blog.author.name}`,
        createdAt: blog.createdAt,
      })),
      ...recentTours.map((tour) => ({
        id: tour.id,
        type: 'tour_creation',
        title: `New tour: ${tour.title}`,
        description: `By ${tour.agency.name} - $${tour.price}`,
        createdAt: tour.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}