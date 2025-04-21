/* eslint-disable prettier/prettier */
import { prisma } from '@/prisma/prisma';
import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class EventService {
    constructor() {}

    // Find all events
    async findAll() {
        return prisma.event.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    // Find an event by ID
    async findOne(id: string) {
        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            throw new NotFoundException(`Event with ID "${id}" not found`);
        }

        return event;
    }
    // Create a new event
    async create(data) {
        return prisma.event.create({
            data,
        });
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
    async saveEvent(userId: string, eventId: string) {
        return prisma.saveEvent.create({
            data: {
                userId,
                eventId,
            },
        });
    }
    // remove event from favorites
    async removeEvent(userId: string, eventId: string) {
        return prisma.saveEvent.deleteMany({
            where: {
                userId,
                eventId,
            },
        });
    }
    async findEventByUserId(userId: string) {
        return prisma.saveEvent.findMany({
            where: {
                userId,
            },
            include: {
                event: true,
            },
        });
    }
}
