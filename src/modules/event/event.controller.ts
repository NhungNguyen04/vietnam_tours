/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { EventService } from './event.service';
import { EventQueryParams } from '../../common/types/common.types';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { Prisma } from '@prisma/client';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post()
    create(@Body() createEventDto: CreateEventDto) {
        return this.eventService.create(createEventDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('category') category?: string
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        
        // Pass parameters as an object to match service method signature
        return this.eventService.findAll({ 
            page: pageNum, 
            limit: limitNum, 
            search, 
            category 
        });
    }

    // Search route
    @Get('search')
    searchEvents(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        
        // Pass parameters as an object to match service method signature
        return this.eventService.searchEvents({ 
            page: pageNum, 
            limit: limitNum, 
            search: search || '' 
        });
    }

    // Month route should come before :id route to avoid conflicts
    @Get('month/:year/:month')
    async getEventsByMonth(
        @Param('year') year: string, 
        @Param('month') month: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string
    ) {
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        
        // Pass parameters as an object to match service method signature
        return this.eventService.getEventsByMonth({ 
            year: yearNum, 
            month: monthNum, 
            page: pageNum, 
            limit: limitNum, 
            search 
        });
    }

    // Saved events routes
    @Get('saved/:userid')
    findSaveEvent(@Param('userid') userid: string) {
        return this.eventService.findSaveEvent(userid);
    }

    @Post('saved')
    addSaveEvent(@Body() body: { userId: string; eventId: string }) {
        return this.eventService.addSaveEvent(body.userId, body.eventId);
    }

    @Delete('saved/:userid/:eventid')
    removeSaveEvent(@Param('userid') userid: string, @Param('eventid') eventid: string) {
        return this.eventService.removeSaveEvent(userid, eventid);
    }

    @Get('saved/:userid/:eventid')
    async isEventSaved(@Param('userid') userid: string, @Param('eventid') eventid: string) {
        const isSaved = await this.eventService.isEventSaved(userid, eventid);
        return { isSaved };
    }

    // This route conflicts with the above - need to be more specific
    @Get('saved/count/:eventid')
    async getSavedCount(@Param('eventid') eventid: string) {
        const count = await this.eventService.getSavedCount(eventid);
        return { count };
    }

    // Generic :id routes come last to avoid conflicts
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateEventDto: UpdateEventDto,
    ) {
        return this.eventService.update(id, updateEventDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventService.remove(id);
    }
}