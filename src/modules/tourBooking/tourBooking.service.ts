import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateTourBookingInput, UpdateTourBookingInput } from '../../../schemas';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class TourBookingService {
  constructor() {}

  async createBooking(userId: string, dto: CreateTourBookingInput) {
    // Find the tour
    const tour = await prisma.tour.findUnique({
      where: { id: dto.tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    // Check if the tour still has capacity
    const existingBookingsCount = await prisma.tourBooking.count({
      where: {
        tourId: dto.tourId,
        bookingDate: dto.bookingDate,
        status: { notIn: ['CANCELLED'] },
      },
    });

    const totalParticipants = await prisma.tourBooking.aggregate({
      where: {
        tourId: dto.tourId,
        bookingDate: dto.bookingDate,
        status: { notIn: ['CANCELLED'] },
      },
      _sum: {
        participants: true,
      },
    });

    const bookedParticipants = totalParticipants._sum.participants || 0;
    
    if (bookedParticipants + dto.participants > tour.maxCapacity) {
      throw new BadRequestException('This tour is at max capacity for the selected date');
    }

    // Calculate total price
    const totalPrice = tour.price * dto.participants;

    // Create the booking
    return prisma.tourBooking.create({
      data: {
        tourId: dto.tourId,
        userId,
        bookingDate: dto.bookingDate,
        participants: dto.participants,
        totalPrice,
        notes: dto.notes,
      },
      include: {
        tour: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserBookings(userId: string) {
    return prisma.tourBooking.findMany({
      where: { userId },
      include: {
        tour: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(id: string, userId: string) {
    const booking = await prisma.tourBooking.findUnique({
      where: { id },
      include: {
        tour: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this booking');
    }

    return booking;
  }

  async updateBooking(id: string, userId: string, dto: UpdateTourBookingInput) {
    const booking = await prisma.tourBooking.findUnique({
      where: { id },
      include: { tour: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }

    // If status is being updated to CANCELLED, no need for additional checks
    if (dto.status === BookingStatus.CANCELLED) {
      return prisma.tourBooking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
        include: { tour: true },
      });
    }

    // If participants are being updated, check capacity
    if (dto.participants && dto.participants > booking.participants) {
      const additionalParticipants = dto.participants - booking.participants;
      
      const totalParticipants = await prisma.tourBooking.aggregate({
        where: {
          tourId: booking.tourId,
          bookingDate: booking.bookingDate,
          status: { notIn: ['CANCELLED'] },
          id: { not: booking.id }, // Exclude current booking
        },
        _sum: {
          participants: true,
        },
      });
      
      const bookedParticipants = (totalParticipants._sum.participants || 0) + dto.participants;
      
      if (bookedParticipants > booking.tour.maxCapacity) {
        throw new BadRequestException('Cannot increase participants as it exceeds tour capacity');
      }
      
      // Recalculate price if participants change
      const totalPrice = booking.tour.price * dto.participants;
      
      return prisma.tourBooking.update({
        where: { id },
        data: {
          participants: dto.participants,
          totalPrice,
          notes: dto.notes,
          status: dto.status,
        },
        include: { tour: true },
      });
    }

    // Otherwise just update the provided fields
    return prisma.tourBooking.update({
      where: { id },
      data: {
        participants: dto.participants,
        notes: dto.notes,
        status: dto.status,
      },
      include: { tour: true },
    });
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await prisma.tourBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this booking');
    }

    return prisma.tourBooking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: { tour: true },
    });
  }

  async updateBookingStatus(id: string) {
    const booking = await prisma.tourBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only allow status updates to CONFIRMED or CANCELLED
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled booking');
    }

    let newStatus = booking.status;
    if (newStatus === BookingStatus.PENDING) {
      newStatus = BookingStatus.CONFIRMED;
    } else if (newStatus === BookingStatus.CONFIRMED) {
      newStatus = BookingStatus.COMPLETED;
    }

    return prisma.tourBooking.update({
      where: { id },
      data: { status: newStatus },
      include: { tour: true },
    });
  }

  async getTourBookings(tourId: string) {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour.bookings;
  }
}
