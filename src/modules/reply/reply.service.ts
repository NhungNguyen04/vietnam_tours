import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReplyDto, UpdateReplyDto, VoteReplyDto } from './reply.dto';
import { prisma } from '@/prisma/prisma';

@Injectable()
export class ReplyService {
  constructor() {}

  async create(userId: string, createReplyDto: CreateReplyDto) {
    const { commentId, content } = createReplyDto;

    // Check if comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return prisma.reply.create({
      data: {
        content,
        comment: {
          connect: { id: commentId },
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
      },
    });
  }

  async update(id: string, userId: string, updateReplyDto: UpdateReplyDto) {
    // Check if reply exists and belongs to the user
    const reply = await prisma.reply.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    if (reply.userId !== userId) {
      throw new Error('You are not authorized to update this reply');
    }

    return prisma.reply.update({
      where: { id },
      data: {
        content: updateReplyDto.content,
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
    // Check if reply exists and belongs to the user
    const reply = await prisma.reply.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    if (reply.userId !== userId) {
      throw new Error('You are not authorized to delete this reply');
    }

    // Delete votes first, then the reply
    await prisma.$transaction([
      prisma.replyVote.deleteMany({
        where: { replyId: id },
      }),
      prisma.reply.delete({
        where: { id },
      }),
    ]);

    return { success: true, message: 'Reply deleted successfully' };
  }

  async vote(replyId: string, userId: string, voteDto: VoteReplyDto) {
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${replyId} not found`);
    }

    // Check if user has already voted
    const existingVote = await prisma.replyVote.findUnique({
      where: {
        userId_replyId: {
          userId,
          replyId,
        },
      },
    });

    if (existingVote) {
      // If vote type is the same, remove the vote (toggle)
      if (existingVote.type === voteDto.type) {
        await prisma.replyVote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return { message: 'Vote removed successfully' };
      } 
      
      // If vote type is different, update the vote
      return prisma.replyVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          type: voteDto.type,
        },
      });
    }

    // Create new vote
    return prisma.replyVote.create({
      data: {
        type: voteDto.type,
        user: {
          connect: { id: userId },
        },
        reply: {
          connect: { id: replyId },
        },
      },
    });
  }

  async getVoteSummary(replyId: string) {
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        votes: true,
      },
    });

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${replyId} not found`);
    }

    const upvotes = reply.votes.filter(vote => vote.type === 'UP').length;
    const downvotes = reply.votes.filter(vote => vote.type === 'DOWN').length;

    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
    };
  }

  async getUserVote(replyId: string, userId: string) {
    const vote = await prisma.replyVote.findUnique({
      where: {
        userId_replyId: {
          userId,
          replyId,
        },
      },
    });

    return vote ?? { type: null };
  }
}
