import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; // If not globally available or for scoped config
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
  imports: [
    HttpModule, // For making HTTP requests
    ConfigModule, // To access ConfigService
  ],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}