import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour } from '@prisma/client';
import { prisma } from '@/prisma/prisma';
import { createTourSchema, updateTourSchema } from '../../../schemas';

@Injectable()
export class TourService {
  constructor() {}

  async create(createTourDto: CreateTourDto, agencyId: string): Promise<Tour> {
    try {
      // Validate the input using the schema
      const validatedData = createTourSchema.parse(createTourDto);
      console.log(validatedData);
      
      return prisma.tour.create({
        data: {
          ...validatedData,
          agencyId,
        },
      });
    } catch (error) {
      console.log(error);
      if (error.errors) {
        throw new BadRequestException(error.errors);
      }
      throw error;
    }
  }

 async findAll(
  page = 1, 
  limit = 10,
  category?: string,
  province?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<{ tours: Tour[]; total: number; pages: number }> {
  const skip = (page - 1) * limit;
  
  // Ensure numeric values
  const limitNum = Number(limit);
  const minPriceNum = minPrice ? Number(minPrice) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;
  
  // Build filter object based on provided parameters
  const where: any = {};
  
  if (category) {
    where.category = category;
  }
  
  if (province) {
    where.province = province;
  }
  
  if (minPriceNum || maxPriceNum) {
    where.price = {};
    if (minPriceNum) where.price.gte = minPriceNum;
    if (maxPriceNum) where.price.lte = maxPriceNum;
  }

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.tour.count({ where }),
  ]);

  const pages = Math.ceil(total / limitNum);

  return { tours, total, pages };
}

  async findOne(id: string): Promise<Tour> {
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            website: true,
            phoneNumber: true,
          },
        },
        location: true,
        bookings: {
          select: {
            id: true,
            bookingDate: true,
            participants: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto): Promise<Tour> {
    try {
      // Validate the input using the schema
      const validatedData = updateTourSchema.parse(updateTourDto);
      
      await this.findOne(id); // Check if tour exists
      
      return prisma.tour.update({
        where: { id },
        data: validatedData,
      });
    } catch (error) {
      if (error.errors) {
        throw new BadRequestException(error.errors);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Tour> {
    await this.findOne(id); // Check if tour exists
    
    return prisma.tour.delete({
      where: { id },
    });
  }

  async findByAgency(agencyId: string): Promise<Tour[]> {
    return prisma.tour.findMany({
      where: { agencyId },
      include: {
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getToursByProvince(province: string): Promise<Tour[]> {
    return prisma.tour.findMany({
      where: { province: province as any },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
