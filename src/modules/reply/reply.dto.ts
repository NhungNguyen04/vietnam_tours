import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDto {
  @ApiProperty({ description: 'Content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'ID of the comment being replied to' })
  @IsString()
  @IsNotEmpty()
  commentId: string;
}

export class UpdateReplyDto {
  @ApiProperty({ description: 'Updated content of the reply' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class VoteReplyDto {
  type: 'UP' | 'DOWN';
}
