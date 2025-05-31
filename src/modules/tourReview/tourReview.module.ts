import { Module } from '@nestjs/common';
import { TourReviewController } from './tourReview.controller';
import { TourReviewService } from './tourReview.service';

@Module({
  imports: [],
  controllers: [TourReviewController],
  providers: [TourReviewService],
  exports: [TourReviewService],
})
export class TourReviewModule {}
