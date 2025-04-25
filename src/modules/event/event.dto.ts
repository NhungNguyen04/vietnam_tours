/* eslint-disable prettier/prettier */
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
}