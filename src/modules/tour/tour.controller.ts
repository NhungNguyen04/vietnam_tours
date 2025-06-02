/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';


@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  create(@Body() createTourDto: CreateTourDto, @Query('agencyId') agencyId: string) {
    return this.tourService.create(createTourDto, agencyId);
  }


  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('province') province?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('q') search?: string,
  ) {
    return this.tourService.findAll(
      page, 
      limit, 
      category, 
      province, 
      minPrice, 
      maxPrice,
      search
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.tourService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tourService.remove(id);
  }

  @Get('agency/:agencyId')
  findByAgency(@Param('agencyId') agencyId: string) {
    return this.tourService.findByAgency(agencyId);
  }

  @Get('province/:province')
  getToursByProvince(@Param('province') province: string) {
    return this.tourService.getToursByProvince(province);
  }
}
