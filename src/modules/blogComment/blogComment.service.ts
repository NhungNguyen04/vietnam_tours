import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogCommentDto, UpdateBlogCommentDto, VoteCommentDto } from './blogComment.dto';
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
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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

    // Delete all votes and replies first
    await prisma.$transaction([
      prisma.replyVote.deleteMany({
        where: { 
          reply: {
            commentId: id 
          }
        },
      }),
      prisma.reply.deleteMany({
        where: { commentId: id },
      }),
      prisma.commentVote.deleteMany({
        where: { commentId: id },
      }),
      prisma.blogComment.delete({
        where: { id },
      }),
    ]);

    return { success: true, message: 'Comment deleted successfully' };
  }

  async vote(commentId: string, userId: string, voteDto: VoteCommentDto) {
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Check if user has already voted
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingVote) {
      // If vote type is the same, remove the vote (toggle)
      if (existingVote.type === voteDto.type) {
        await prisma.commentVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return { message: 'Vote removed successfully' };
      } 
      
      // If vote type is different, update the vote
      return prisma.commentVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          type: voteDto.type,
        },
      });
    }

    // Create new vote
    return prisma.commentVote.create({
      data: {
        type: voteDto.type,
        user: {
          connect: { id: userId },
        },
        comment: {
          connect: { id: commentId },
        },
      },
    });
  }

  async getVoteSummary(commentId: string) {
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: {
        votes: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    const upvotes = comment.votes.filter(vote => vote.type === 'UP').length;
    const downvotes = comment.votes.filter(vote => vote.type === 'DOWN').length;

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    };
  }

  async getUserVote(commentId: string, userId: string) {
    const vote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    return vote ?? { type: null };
  }
}
