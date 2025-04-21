import { Update } from './../../../../frontend-vonder/node_modules/next/dist/build/swc/types.d';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Name of the event' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Date of the event' })
  @IsString()
  @IsNotEmpty()
  date: string; // Consider using Date type if you want to handle date objects
}

export class UpdateEventDto {
  @ApiProperty({ description: 'Name of the event' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Date of the event' })
  @IsString()
  @IsNotEmpty()
  date: string; // Consider using Date type if you want to handle date objects
}