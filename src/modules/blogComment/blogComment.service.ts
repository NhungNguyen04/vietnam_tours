import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogCommentDto, UpdateBlogCommentDto } from './blogComment.dto';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class BlogCommentService {
  constructor() {}

  async findAllByBlog(blogId: string) {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    return prisma.blogComment.findMany({
      where: { blogId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(userId: string, createCommentDto: CreateBlogCommentDto) {
    const { blogId, content } = createCommentDto;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    return prisma.blogComment.create({
      data: {
        content,
        blog: {
          connect: { id: blogId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: true,
      },
    });
  }

  async update(id: string, userId: string, updateCommentDto: UpdateBlogCommentDto) {
    // Check if comment exists and belongs to the user
    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.userId !== userId) {
      throw new Error('You are not authorized to update this comment');
    }

    return prisma.blogComment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    // Check if comment exists and belongs to the user
    const comment = await prisma.blogComment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.userId !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    // Delete all replies first
    await prisma.reply.deleteMany({
      where: { commentId: id },
    });

    // Then delete the comment
    await prisma.blogComment.delete({
      where: { id },
    });

    return { success: true, message: 'Comment deleted successfully' };
  }
}
