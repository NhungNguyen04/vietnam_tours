import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum RadiusUnit {
  KM = 'KM',
  MI = 'MI',
}

export enum HotelSource {
  ALL = 'ALL',
  BEDBANK = 'BEDBANK',
  DIRECTCHAIN = 'DIRECTCHAIN',
}

export class HotelSearchDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number = 20;

  @IsOptional()
  @IsEnum(RadiusUnit)
  radiusUnit?: RadiusUnit = RadiusUnit.KM;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  
  @IsOptional()
  @IsArray()
  amenities?: string[] = [];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  ratings?: string[] = [];

  @IsOptional()
  @IsEnum(HotelSource)
  hotelSource?: HotelSource = HotelSource.ALL;
}