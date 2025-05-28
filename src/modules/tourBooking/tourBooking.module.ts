import { Module } from '@nestjs/common';
import { TourBookingController } from './tourBooking.controller';
import { TourBookingService } from './tourBooking.service';

@Module({
  imports: [],
  controllers: [TourBookingController],
  providers: [TourBookingService],
  exports: [TourBookingService],
})
export class TourBookingModule {}
