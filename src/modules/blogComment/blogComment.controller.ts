import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BlogCommentService } from './blogComment.service';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from './blogComment.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiNotFoundResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';

@ApiTags('blog-comments')
@Controller('blog-comments')
export class BlogCommentController {
  constructor(private readonly commentService: BlogCommentService) {}

  @ApiOperation({ summary: 'Get all comments for a specific blog post' })
  @ApiParam({ name: 'blogId', description: 'Blog post ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all comments for the specified blog post'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Get('blog/:blogId')
  findAllByBlog(@Param('blogId') blogId: string) {
    return this.commentService.findAllByBlog(blogId);
  }

  @ApiOperation({ summary: 'Create a new comment on a blog post' })
  @ApiCreatedResponse({ 
    description: 'The comment has been successfully created'
  })
  @ApiBody({ type: CreateBlogCommentDto })
  @ApiParam({ name: 'userId', description: 'ID of the user creating the comment' })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Post(':userId')
  create(
    @Param('userId') userId: string, 
    @Body() createCommentDto: CreateBlogCommentDto
  ) {
    return this.commentService.create(userId, createCommentDto);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user updating the comment' })
  @ApiBody({ type: UpdateBlogCommentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The comment has been successfully updated'
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @Put(':id/:userId')
  update(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateCommentDto: UpdateBlogCommentDto,
  ) {
    return this.commentService.update(id, userId, updateCommentDto);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user deleting the comment' })
  @ApiResponse({ 
    status: 200, 
    description: 'The comment has been successfully deleted'
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @Delete(':id/:userId')
  delete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.commentService.delete(id, userId);
  }
}
