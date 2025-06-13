import { prisma } from '@/prisma/prisma';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class BlogSaveService {
  constructor() {}

  async saveBlog(userId: string, blogId: string) {
    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Check if already saved
    const existingSave = await prisma.saveBlog.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (existingSave) {
      throw new ConflictException('Blog already saved');
    }

    // Create saved blog entry
    return prisma.saveBlog.create({
      data: {
        userId,
        blogId,
      },
      include: {
        blog: true,
      },
    });
  }

  async unsaveBlog(userId: string, blogId: string) {
    // Check if saved blog exists
    const savedBlog = await prisma.saveBlog.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (!savedBlog) {
      throw new NotFoundException('Saved blog not found');
    }

    // Delete saved blog entry
    return prisma.saveBlog.delete({
      where: {
        id: savedBlog.id,
      },
    });
  }

  async getUserSavedBlogs(userId: string) {
    return prisma.saveBlog.findMany({
      where: {
        userId,
      },
      include: {
        blog: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            locations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async checkIfBlogSaved(userId: string, blogId: string) {
    const savedBlog = await prisma.saveBlog.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    return { isSaved: !!savedBlog };
  }

  async countSaves(blogId: string) {
    return prisma.saveBlog.count({
      where: {
        blogId,
      },
    });
  }
}
