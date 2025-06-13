import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService],
})

export class HotelsModule {}