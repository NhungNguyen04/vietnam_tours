import { prisma } from '@/prisma/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TripService {
  constructor() {}

  // Trip CRUD operations
  async createTrip(data: Prisma.TripCreateInput) {
    return prisma.trip.create({
      data,
      include: {
        location: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAllTrips(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TripWhereUniqueInput;
    where?: Prisma.TripWhereInput;
    orderBy?: Prisma.TripOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.trip.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        location: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  async findTripById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        location: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async updateTrip(id: string, data: Prisma.TripUpdateInput) {
    try {
      return await prisma.trip.update({
        where: { id },
        data,
        include: {
          location: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }
      throw error;
    }
  }

  async deleteTrip(id: string) {
    try {
      return await prisma.trip.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }
      throw error;
    }
  }

  // TripParticipants CRUD operations
  async addParticipant(tripId: string, userId: string) {
    try {
      return await prisma.tripParticipants.create({
        data: {
          trip: { connect: { id: tripId } },
          user: { connect: { id: userId } },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          trip: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('User is already a participant in this trip');
      }
      throw error;
    }
  }

  async removeParticipant(tripId: string, userId: string) {
    try {
      return await prisma.tripParticipants.delete({
        where: {
          tripId_userId: {
            tripId,
            userId,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Participant with userId ${userId} not found in trip ${tripId}`,
        );
      }
      throw error;
    }
  }

  async findTripParticipants(tripId: string) {
    return prisma.tripParticipants.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async findUserTrips(userId: string) {
    return prisma.trip.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        location: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }
}
