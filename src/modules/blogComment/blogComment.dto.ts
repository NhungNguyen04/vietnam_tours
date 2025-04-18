import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogCommentDto {
  @ApiProperty({ description: 'Content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'ID of the blog post being commented on' })
  @IsString()
  @IsNotEmpty()
  blogId: string;
}

export class UpdateBlogCommentDto {
  @ApiProperty({ description: 'Updated content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class VoteCommentDto {
  type: 'UP' | 'DOWN';
}
