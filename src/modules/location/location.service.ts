/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class LocationService {
  constructor() {}

  async findAll() {
    return prisma.location.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }

    return location;
  }

  async create(data) {
    return prisma.location.create({
      data,
    });
  }

  async update(id: string, data) {
    try {
      return await prisma.location.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Location with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // First check if the location exists
      const location = await prisma.location.findUnique({
        where: { id },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID "${id}" not found`);
      }

      // Delete all favorites associated with this location
      await prisma.favorite.deleteMany({
        where: { locationId: id },
      });

      // Then delete the location
      return await prisma.location.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Location with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async findByCategory(category: string) {
    return prisma.location.findMany({
      where: {
        category: category as any,
      },
    });
  }

  async findByProvince(province: string) {
    return prisma.location.findMany({
      where: {
        province: province as any,
      },
    });
  }

  async findFavorite(userId: string) {
    return prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        location: true,
      },
    });
  }

  async addFavorite(userId: string, locationId: string) {
    // Check if the favorite already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (existingFavorite) {
      throw new Error('Favorite already exists');
    }

    return prisma.favorite.create({
      data: {
        userId,
        locationId,
      },
    });
  }

  async removeFavorite(userId: string, locationId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException(`Favorite not found`);
    }

    return prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });
  }
}
