import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, VoteBlogDto } from './blog.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all blog posts with their metadata'
  })
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @ApiOperation({ summary: 'Get a specific blog post by ID' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the blog post with the specified ID'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiCreatedResponse({ 
    description: 'The blog post has been successfully created'
  })
  @ApiBody({ type: CreateBlogDto })
  @ApiParam({ name: 'userId', description: 'ID of the user creating the blog post' })
  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(userId, createBlogDto);
  }

  @ApiOperation({ summary: 'Update a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user updating the blog post' })
  @ApiBody({ type: UpdateBlogDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The blog post has been successfully updated'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Put(':id/:userId')
  update(
    @Param('id') id: string, 
    @Param('userId') userId: string, 
    @Body() updateBlogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, userId, updateBlogDto);
  }

  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user deleting the blog post' })
  @ApiResponse({ 
    status: 200, 
    description: 'The blog post has been successfully deleted'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Delete(':id/:userId')
  delete(@Param('id') id: string, @Param('userId') userId: string) {
    return this.blogService.delete(id, userId);
  }

  @ApiOperation({ summary: 'Vote on a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: VoteBlogDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Vote registered successfully'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Post(':id/vote/:userId')
  vote(
    @Param('id') id: string, 
    @Param('userId') userId: string, 
    @Body() voteDto: VoteBlogDto
  ) {
    return this.blogService.vote(id, userId, voteDto);
  }

  @ApiOperation({ summary: 'Get vote summary for a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Vote summary retrieved successfully'
  })
  @ApiNotFoundResponse({ description: 'Blog post not found' })
  @Get(':id/votes')
  getVoteSummary(@Param('id') id: string) {
    return this.blogService.getVoteSummary(id);
  }

  @ApiOperation({ summary: 'Get user vote for a blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User vote retrieved successfully'
  })
  @Get(':id/vote/:userId')
  getUserVote(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.blogService.getUserVote(id, userId);
  }
}

