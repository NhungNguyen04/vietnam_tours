import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto, VoteBlogDto } from './blog.dto';
import { prisma } from '@/prisma/prisma';
import { Category } from '@prisma/client';

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
            votes: true,
          },
        },
        votes: {
          select: {
            type: true,
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
                votes: true,
                _count: {
                  select: {
                    votes: true,
                  },
                },
              },
            },
            votes: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        votes: true,
        _count: {
          select: {
            votes: true,
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
    const {...blogData } = createBlogDto;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // Check if locations exist
    if (blogData.locationIds && blogData.locationIds.length > 0) {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: blogData.locationIds },
        },
      });
      if (locations.length !== blogData.locationIds.length) {
        throw new NotFoundException(`Some locations not found`);
      }
    }
    // Check if category is valid
    const validCategories = Object.values(Category);
    if (!validCategories.includes(blogData.category as Category)) {
      throw new NotFoundException(`Invalid category`);
    }

    // Create the blog post
    return prisma.blog.create({
      data: {
        ...blogData,
        author: {
          connect: { id: userId },
        },
        locations: blogData.locationIds && blogData.locationIds.length > 0 
          ? { connect: blogData.locationIds.map(id => ({ id })) }
          : undefined,
        category: blogData.category as Category, // Ensure category is cast or converted to the correct type
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

    // Delete all comments, replies, and votes first
    await prisma.$transaction([
      prisma.replyVote.deleteMany({
        where: {
          reply: {
            comment: {
              blogId: id,
            },
          },
        },
      }),
      prisma.reply.deleteMany({
        where: {
          comment: {
            blogId: id,
          },
        },
      }),
      prisma.commentVote.deleteMany({
        where: {
          comment: {
            blogId: id,
          }
        }
      }),
      prisma.blogComment.deleteMany({
        where: {
          blogId: id,
        },
      }),
      prisma.blogVote.deleteMany({
        where: {
          blogId: id,
        }
      }),
      prisma.blog.delete({
        where: { id },
      }),
    ]);

    return { success: true, message: 'Blog deleted successfully' };
  }

  async vote(blogId: string, userId: string, voteDto: VoteBlogDto) {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    // Check if user has already voted
    const existingVote = await prisma.blogVote.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (existingVote) {
      // If vote type is the same, remove the vote (toggle)
      if (existingVote.type === voteDto.type) {
        await prisma.blogVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return { message: 'Vote removed successfully' };
      } 
      
      // If vote type is different, update the vote
      return prisma.blogVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          type: voteDto.type,
        },
      });
    }

    // Create new vote
    return prisma.blogVote.create({
      data: {
        type: voteDto.type,
        user: {
          connect: { id: userId },
        },
        blog: {
          connect: { id: blogId },
        },
      },
    });
  }

  async getVoteSummary(blogId: string) {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        votes: true,
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const upvotes = blog.votes.filter(vote => vote.type === 'UP').length;
    const downvotes = blog.votes.filter(vote => vote.type === 'DOWN').length;

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    };
  }

  async getUserVote(blogId: string, userId: string) {
    const vote = await prisma.blogVote.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    return vote ?? { type: null };
  }
}
