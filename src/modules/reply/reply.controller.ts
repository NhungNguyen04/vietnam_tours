import { Controller, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { CreateReplyDto, UpdateReplyDto } from './reply.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiNotFoundResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';

@ApiTags('replies')
@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @ApiOperation({ summary: 'Create a new reply to a comment' })
  @ApiCreatedResponse({ 
    description: 'The reply has been successfully created'
  })
  @ApiBody({ type: CreateReplyDto })
  @ApiParam({ name: 'userId', description: 'ID of the user creating the reply' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @Post(':userId')
  create(
    @Param('userId') userId: string, 
    @Body() createReplyDto: CreateReplyDto
  ) {
    return this.replyService.create(userId, createReplyDto);
  }

  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user updating the reply' })
  @ApiBody({ type: UpdateReplyDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The reply has been successfully updated'
  })
  @ApiNotFoundResponse({ description: 'Reply not found' })
  @Put(':id/:userId')
  update(
    @Param('id') id: string, 
    @Param('userId') userId: string, 
    @Body() updateReplyDto: UpdateReplyDto
  ) {
    return this.replyService.update(id, userId, updateReplyDto);
  }

  @ApiOperation({ summary: 'Delete a reply' })
  @ApiParam({ name: 'id', description: 'Reply ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user deleting the reply' })
  @ApiResponse({ 
    status: 200, 
    description: 'The reply has been successfully deleted'
  })
  @ApiNotFoundResponse({ description: 'Reply not found' })
  @Delete(':id/:userId')
  delete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.replyService.delete(id, userId);
  }
}
