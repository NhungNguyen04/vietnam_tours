import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class BlogService {
  constructor() {}

  async findAll() {
    return prisma.blog.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        locations: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
          take: 3,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        locations: true,
        comments: {
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
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async create(userId: string, createBlogDto: CreateBlogDto) {
    const { locationIds, ...blogData } = createBlogDto;

    return prisma.blog.create({
      data: {
        ...blogData,
        author: {
          connect: { id: userId },
        },
        locations: {
          connect: locationIds.map(id => ({ id })),
        },
      },
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
    });
  }

  async update(id: string, userId: string, updateBlogDto: UpdateBlogDto) {
    // Check if blog exists and belongs to the user
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    if (blog.authorId !== userId) {
      throw new Error('You are not authorized to update this blog');
    }

    const { locationIds, ...blogData } = updateBlogDto;

    const updateData: any = { ...blogData };
    
    if (locationIds) {
      updateData.locations = {
        set: [],
        connect: locationIds.map(id => ({ id })),
      };
    }

    return prisma.blog.update({
      where: { id },
      data: updateData,
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
    });
  }

  async delete(id: string, userId: string) {
    // Check if blog exists and belongs to the user
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    if (blog.authorId !== userId) {
      throw new Error('You are not authorized to delete this blog');
    }

    // Delete all comments and replies first
    await prisma.$transaction([
      prisma.reply.deleteMany({
        where: {
          comment: {
            blogId: id,
          },
        },
      }),
      prisma.blogComment.deleteMany({
        where: {
          blogId: id,
        },
      }),
      prisma.blog.delete({
        where: { id },
      }),
    ]);

    return { success: true, message: 'Blog deleted successfully' };
  }
}
