import { Controller, Get, Post, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlogSaveService } from './blogSave.service';

@ApiTags('blog-saves')
@Controller('blog-saves')
export class BlogSaveController {
  constructor(private readonly blogSaveService: BlogSaveService) {}

  @Post(':blogId/:userId')
  @ApiOperation({ summary: 'Save a blog for a user' })
  @ApiResponse({ status: 201, description: 'Blog has been saved successfully' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  @ApiResponse({ status: 409, description: 'Blog already saved' })
  async saveBlog(@Param('userId') userId: string, @Param('blogId') blogId: string) {
    return this.blogSaveService.saveBlog(userId, blogId);
  }

  @Delete(':blogId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave a blog for a user' })
  @ApiResponse({ status: 204, description: 'Blog has been unsaved successfully' })
  @ApiResponse({ status: 404, description: 'Saved blog not found' })
  async unsaveBlog(@Param('userId') userId: string, @Param('blogId') blogId: string) {
    return this.blogSaveService.unsaveBlog(userId, blogId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get all saved blogs for a user' })
  @ApiResponse({ status: 200, description: 'Returns all saved blogs' })
  async getUserSavedBlogs(@Param('userId') userId: string) {
    return this.blogSaveService.getUserSavedBlogs(userId);
  }

  @Get(':blogId/status/:userId')
  @ApiOperation({ summary: 'Check if a blog is saved by a user' })
  @ApiResponse({ status: 200, description: 'Returns save status' })
  async checkIfBlogSaved(@Param('userId') userId: string, @Param('blogId') blogId: string) {
    return this.blogSaveService.checkIfBlogSaved(userId, blogId);
  }

  @Get('count/:blogId')
  @ApiOperation({ summary: 'Get the number of saves for a blog' })
  @ApiResponse({ status: 200, description: 'Returns count of saves' })
  async countSaves(@Param('blogId') blogId: string) {
    const count = await this.blogSaveService.countSaves(blogId);
    return { count };
  }
}
