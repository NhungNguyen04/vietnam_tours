/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import { EventService } from './event.service';
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
    findAll() {
        return this.eventService.findAll();
    }
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
    isEventSaved(@Param('userid') userid: string, @Param('eventid') eventid: string) {
        return this.eventService.isEventSaved(userid, eventid);
    }
    @Get('saved/:eventid')
    getSavedCount(@Param('eventid') eventid: string) {
        return this.eventService.getSavedCount(eventid);
    }
}
