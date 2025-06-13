import { Controller, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelSearchDto } from './dto/hotel-search.dto';

@Controller('api/hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async searchHotels(@Query() searchDto: HotelSearchDto) {
    return await this.hotelsService.searchHotels(searchDto);
  }

  @Get('test')
  async testEndpoint() {
    return {
      success: true,
      message: 'Hotels API is working!',
      timestamp: new Date().toISOString(),
    };
  }
}