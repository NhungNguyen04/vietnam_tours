/* eslint-disable prettier/prettier */
import { prisma } from '@/prisma/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class EventService {
    constructor() {}
    // Find all events with related locations and their location details
    async findAll() {
        return prisma.event.findMany({
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
    // Create a new event
    async create(data) {
        const { locations, ...eventData } = data;
        
        const payload = {
          ...eventData,
          locations: {
            create: locations.map(location => ({
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
    async update(id: string, data) {
        try {
            return await prisma.event.update({
                where: { id },
                data,
            });
        } catch (error) {
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
    // Find events by category
    async findByProvince(province: string) {
        return prisma.event.findMany({
            where: {
                locations: {
                    some: {
                        location: {
                            province: province as any,
                        },
                    },
                }
            },
            include: {
                locations: true, // Include related locations if needed
            },
        });
    }
    // Find events by location ID
    async findByLocation(locationId: string) {
        return prisma.event.findMany({
            where: {
                locations: {
                  some: {
                    id: locationId, 
                  }
                }
              },
            include: {
                locations: true,
            }
        });
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
    // remove event from favorites
    async removeSaveEvent(userId: string, eventId: string) {
        return prisma.saveEvent.deleteMany({
            where: {
                userId,
                eventId,
            },
        });
    }
    async findSaveEvent(userId: string) {
        return prisma.saveEvent.findMany({
            where: {
                userId,
            },
            include: {
                event: true,
            },
        });
    }
    async isEventSaved(userId: string, eventId: string) {
        const savedEvent = await prisma.saveEvent.findFirst({
            where: {
                userId,
                eventId,
            },
        });
        return !!savedEvent;
    }
    async getSavedCount(eventId: string){
        const count = await prisma.saveEvent.count({
            where: {
                eventId,
            },
        });
        return count;
    }
}
