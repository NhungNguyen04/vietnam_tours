import { Controller, Get, Query, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('api/flights')
export class FlightsController {
  private readonly logger = new Logger(FlightsController.name);

  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  async searchFlights(@Query() queryParams: any) { 
    this.logger.log(`Received flight search request with params: ${JSON.stringify(queryParams)}`);
    return this.flightsService.searchFlights(queryParams);
  }
}