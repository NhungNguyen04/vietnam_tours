/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { LocationQueryParams } from '../../common/types/common.types';
import { LocationService } from './location.service';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  private readonly logger = new Logger(LocationController.name);

  @Post()
  create(@Body() createLocationDto: Prisma.LocationCreateInput) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const params: LocationQueryParams = {
      page,
      limit,
      search,
      category,
    };
    return this.locationService.findAll(params);
  }
  
  @Get('search')
  async search(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const params: LocationQueryParams = {
      page,
      limit,
      search,
      category,
    };
    this.logger.log(`Search requested with params: ${JSON.stringify(params)}`);
    return this.locationService.searchLocations(params);
  }

  @Get('name-search')
  async searchName(@Query('term') term: string) {
    this.logger.log(`Name search requested for term: "${term}"`);
    return this.locationService.searchName(term);
  }

  @Get('category/:category')
  findByCategory(
    @Param('category') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    const params: LocationQueryParams = {
      page,
      limit,
      search,
    };
    return this.locationService.findByCategory(category, params);
  }

  @Get('province/:province')
  findByProvince(@Param('province') province: string) {
    return this.locationService.findByProvince(province);
  }

  @Get('favorite/:userid')
  findFavorite(@Param('userid') userid: string) {
    return this.locationService.findFavorite(userid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: Prisma.LocationUpdateInput,
  ) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }

  @Post('favorite')
  addFavorite(@Body() body: { userId: string; locationId: string }) {
    return this.locationService.addFavorite(body.userId, body.locationId);
  }

  @Delete('favorite/:userid/:locationid')
  removeFavorite(@Param('userid') userid: string, @Param('locationid') locationid: string) {
    return this.locationService.removeFavorite(userid, locationid);
  }
}