import { Controller, Get, Query, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { FlightsService } from './flights.service';
// import { FlightSearchDto } from './flights.service'; // Uncomment if using DTOs

@Controller('api/flights') // Prefix for all routes in this controller
export class FlightsController {
  private readonly logger = new Logger(FlightsController.name);

  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  // @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) // Uncomment for DTO validation
  async searchFlights(@Query() queryParams: any) { // Replace 'any' with 'queryParams: FlightSearchDto' if using DTOs
    this.logger.log(`Received flight search request with params: ${JSON.stringify(queryParams)}`);
    return this.flightsService.searchFlights(queryParams);
  }
}