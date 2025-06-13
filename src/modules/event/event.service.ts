/* eslint-disable prettier/prettier */
import { prisma } from '@/prisma/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse, EventQueryParams } from '../../common/types/common.types';

@Injectable()
export class EventService {
    constructor() {}

    // Helper method to build consistent where clause
    private buildWhereClause(params: EventQueryParams): any {
        const { search, category, province, year, month } = params;
        const where: any = {};

        // Date range filter for year/month
        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of the month
            where.startDate = {
                gte: startDate,
                lte: endDate,
            };
        }

        // Category filter
        if (category) {
            where.locations = {
                some: {
                    location: {
                        category: category as any,
                    },
                },
            };
        }

        // Province filter
        if (province) {
            where.locations = {
                some: {
                    location: {
                        province: province as any,
                    },
                },
            };
        }

        // Search filter
        if (search) {
            const searchConditions: any[] = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];

            where.OR = searchConditions;

            // If we have other filters along with search, combine them properly
            if (category || province || (year && month)) {
                const otherConditions: any[] = [];
                
                if (where.startDate) {
                    otherConditions.push({ startDate: where.startDate });
                    delete where.startDate;
                }
                
                if (where.locations) {
                    otherConditions.push({ locations: where.locations });
                    delete where.locations;
                }

                if (otherConditions.length > 0) {
                    where.AND = [
                        { OR: where.OR },
                        ...otherConditions
                    ];
                    delete where.OR;
                }
            }
        }

        return where;
    }

    // Helper function to create pagination response
    private createPaginatedResponse<T>(
        data: T[],
        total: number,
        page: number,
        limit: number
    ): PaginatedResponse<T> {
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

    // Find all events with pagination and search
    async findAll(params: EventQueryParams = {}): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        
        // Build consistent where clause
        const where = this.buildWhereClause(params);

        // Get total count for pagination
        const total = await prisma.event.count({ where });

        // Get paginated data
        const data = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        return this.createPaginatedResponse(data, total, page, limit);
    }

    // Search events with pagination
    async searchEvents(params: EventQueryParams): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        
        // Use the same helper method for consistency
        const where = this.buildWhereClause(params);

        // Get total count for pagination
        const total = await prisma.event.count({ where });

        // Get paginated data
        const data = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        return this.createPaginatedResponse(data, total, page, limit);
    }

    // Get events by month with pagination
    async getEventsByMonth(params: EventQueryParams): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        // Use the same helper method for consistency
        const where = this.buildWhereClause(params);

        // Get total count for pagination
        const total = await prisma.event.count({ where });

        // Get paginated data
        const data = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        return this.createPaginatedResponse(data, total, page, limit);
    }

    // Find events by category with pagination
    async findByCategory(params: EventQueryParams): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        // Use the same helper method for consistency
        const where = this.buildWhereClause(params);

        // Get total count for pagination
        const total = await prisma.event.count({ where });

        // Get paginated data
        const data = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        return this.createPaginatedResponse(data, total, page, limit);
    }

    // Find events by province with pagination
    async findByProvince(params: EventQueryParams): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        // Use the same helper method for consistency
        const where = this.buildWhereClause(params);

        // Get total count for pagination
        const total = await prisma.event.count({ where });

        // Get paginated data
        const data = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        return this.createPaginatedResponse(data, total, page, limit);
    }

    // Find one
    async findOne(id: string) {
        const event = await prisma.event.findUnique({
          where: { id },
          include: {
            locations:  {
                select: {
                    location: {
                      select: {
                        id: true,
                        name: true,
                        province: true,
                        category: true,
                      }
                    },
                  },
              },
          },
        });
      
        if (!event) {
          throw new NotFoundException(`Event with ID "${id}" not found`);
        }
      
        return event;
    }

    // Find events by location ID
    async findByLocation(locationId: string) {
        return prisma.event.findMany({
            where: {
                locations: {
                  some: {
                    location: {
                        id: locationId
                    }
                  }
                }
              },
            include: {
                locations: {
                    select: {
                        location: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                                category: true,
                            },
                        },
                    },
                },
            }
        });
    }

    // Create a new event
    async create(data: any) {
        const { locations, ...eventData } = data;
        
        const payload = {
          ...eventData,
          locations: {
            create: locations.map((location: any) => ({
              location: { connect: { id: location.locationId || location.id } },
              startDate: location.startDateTime || eventData.startDate,
              endDate: location.endDateTime || eventData.endDate,
              description: location.description || null,
            })),
          },
        };
      
        return prisma.event.create({ data: payload });
    }

    // Update an event by ID
    async update(id: string, data: any) {
        try {
            return await prisma.event.update({
                where: { id },
                data,
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Event with ID "${id}" not found`);
            }
            throw error;
        }
    }

    // Delete an event by ID
    async remove(id: string) {
        try {
            // First check if the event exists
            const event = await prisma.event.findUnique({
                where: { id },
            });

            if (!event) {
                throw new NotFoundException(`Event with ID "${id}" not found`);
            }

            // Delete all favorites associated with this event
            await prisma.saveEvent.deleteMany({
                where: { eventId: id },
            });

            // Now delete the event
            return await prisma.event.delete({
                where: { id },
            });
        } catch (error) {
            throw error;
        }
    }

    // Save event to favorites
    async addSaveEvent(userId: string, eventId: string) {
        return prisma.saveEvent.create({
            data: {
                userId,
                eventId,
            },
        });
    }

    // Remove event from favorites
    async removeSaveEvent(userId: string, eventId: string) {
        return prisma.saveEvent.deleteMany({
            where: {
                userId,
                eventId,
            },
        });
    }

    // Find saved events for a user
    async findSaveEvent(userId: string) {
        return prisma.saveEvent.findMany({
            where: {
                userId,
            },
            include: {
                event: {
                    include: {
                        locations: {
                            select: {
                                location: {
                                    select: {
                                        id: true,
                                        name: true,
                                        province: true,
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    // Check if event is saved by user
    async isEventSaved(userId: string, eventId: string) {
        const savedEvent = await prisma.saveEvent.findFirst({
            where: {
                userId,
                eventId,
            },
        });
        return !!savedEvent;
    }

    // Get saved count for an event
    async getSavedCount(eventId: string) {
        const count = await prisma.saveEvent.count({
            where: {
                eventId,
            },
        });
        return count;
    }
}