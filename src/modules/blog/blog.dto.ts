import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty({ description: 'Title of the blog post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content of the blog post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ 
    description: 'Array of location IDs associated with the blog post',
    type: [String]
  })
  @IsArray()
  @IsNotEmpty()
  locationIds: string[];
}

export class UpdateBlogDto {
  @ApiPropertyOptional({ description: 'Updated title of the blog post' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated content of the blog post' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ 
    description: 'Updated array of location IDs associated with the blog post',
    type: [String]
  })
  @IsArray()
  @IsOptional()
  locationIds?: string[];
}
