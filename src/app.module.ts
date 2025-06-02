/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './modules/location/location.module';
import { UploadModule } from './modules/upload/upload.module';
import { BlogModule } from './modules/blog/blog.module';
import { BlogCommentModule } from './modules/blogComment/blogComment.module';
import { ReplyModule } from './modules/reply/reply.module';
import { TripModule } from './modules/trip/trip.module';
import { EventModule } from './modules/event/event.module';
import { AgencyModule } from './modules/agency/agency.module';
import { TourModule } from './modules/tour/tour.module';
import { FlightsModule } from './modules/flights/flights.module';
import { TourBookingModule } from './modules/tourBooking/tourBooking.module';
import { TourReviewModule } from './modules/tourReview/tourReview.module';
import { HotelsModule } from './modules/hotels/hotels.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    LocationModule,
    UploadModule,
    BlogModule,
    BlogCommentModule,
    ReplyModule,
    TripModule,
    AgencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventModule,
    TourModule,
    FlightsModule,
    TourBookingModule,
    TourReviewModule,
    HotelsModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [AppService, AuthService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}