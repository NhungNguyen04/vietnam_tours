/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '@/prisma/prisma';
import { PaginatedResponse, LocationQueryParams } from '../../common/types/common.types';

@Injectable()
export class LocationService {
  constructor() {}

  // Helper method to build consistent where clause
  private buildWhereClause(search?: string, category?: string): any {
    const where: any = {};

    // Add category filter first
    if (category) {
      where.category = category;
    }

    // Add search filter
    if (search) {
      const searchConditions: any[] = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          district: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];

      // For province enum search, we need to check if the search term matches any enum value
      const provinceValues = [
        'AN_GIANG', 'BA_RIA_VUNG_TAU', 'BAC_GIANG', 'BAC_KAN', 'BAC_LIEU', 'BAC_NINH',
        'BEN_TRE', 'BINH_DINH', 'BINH_DUONG', 'BINH_PHUOC', 'BINH_THUAN', 'CA_MAU',
        'CAO_BANG', 'DAK_LAK', 'DAK_NONG', 'DIEN_BIEN', 'DONG_NAI', 'DONG_THAP',
        'GIA_LAI', 'HA_GIANG', 'HA_NAM', 'HA_TINH', 'HAI_DUONG', 'HAU_GIANG',
        'HOA_BINH', 'HUNG_YEN', 'KHANH_HOA', 'KIEN_GIANG', 'KON_TUM', 'LAI_CHAU',
        'LAM_DONG', 'LANG_SON', 'LAO_CAI', 'LONG_AN', 'NAM_DINH', 'NGHE_AN',
        'NINH_BINH', 'NINH_THUAN', 'PHU_THO', 'PHU_YEN', 'QUANG_BINH', 'QUANG_NAM',
        'QUANG_NGAI', 'QUANG_NINH', 'QUANG_TRI', 'SOC_TRANG', 'SON_LA', 'TAY_NINH',
        'THAI_BINH', 'THAI_NGUYEN', 'THANH_HOA', 'THUA_THIEN_HUE', 'TIEN_GIANG',
        'TRA_VINH', 'TUYEN_QUANG', 'VINH_LONG', 'VINH_PHUC', 'YEN_BAI', 'HA_NOI',
        'HAI_PHONG', 'DA_NANG', 'HO_CHI_MINH', 'CAN_THO'
      ];

      // Check if search term matches any province (case insensitive)
      const matchingProvinces = provinceValues.filter(province => 
        province.toLowerCase().includes(search.toLowerCase().replace(/\s+/g, '_'))
      );

      // Add province conditions if any matches found
      if (matchingProvinces.length > 0) {
        if (matchingProvinces.length === 1) {
          searchConditions.push({
            province: matchingProvinces[0]
          } as any);
        } else {
          searchConditions.push({
            province: {
              in: matchingProvinces
            }
          } as any);
        }
      }

      where.OR = searchConditions;

      // If we have both category and search, we need to combine them properly
      if (category) {
        where.AND = [
          { category: category },
          {
            OR: where.OR
          }
        ];
        // Remove the standalone OR and category since they're now in AND
        delete where.OR;
        delete where.category;
      }
    }

    return where;
  }

  async findAll(params: LocationQueryParams = {}): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      category
    } = params;

    const skip = (page - 1) * limit;

    // Build consistent where clause
    const where = this.buildWhereClause(search, category);

    // Get total count for pagination
    const total = await prisma.location.count({ where });

    // Get paginated results
    const data = await prisma.location.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async create(data: any) {
    return prisma.location.create({
      data,
    });
  }

  async update(id: string, data: any) {
    try {
      return await prisma.location.update({
        where: { id },
        data,
      });
    } catch (error: any) {
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
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Location with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async searchName(term: string) {
    if (!term || term.length < 2) return [];
  
    const results = await prisma.location.findMany({
      where: {
        name: {
          contains: term,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        district: true,
        province: true,
      },
      take: 4,
    });
    return results;
  }

  async findByCategory(category: string, params: LocationQueryParams = {}): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search
    } = params;

    const skip = (page - 1) * limit;

    // Use the same helper method for consistency
    const where = this.buildWhereClause(search, category);

    // Get total count for pagination
    const total = await prisma.location.count({ where });

    // Get paginated results
    const data = await prisma.location.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByProvince(province: string) {
    return prisma.location.findMany({
      where: {
        province: province as any,
      },
    });
  }

  async searchLocations(params: LocationQueryParams): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      search,
      category
    } = params;

    const skip = (page - 1) * limit;

    // Use the same helper method for consistency
    const where = this.buildWhereClause(search, category);

    // Get total count for pagination
    const total = await prisma.location.count({ where });

    // Get paginated results
    const data = await prisma.location.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      throw new ConflictException('Favorite already exists');
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