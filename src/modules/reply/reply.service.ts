import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReplyDto, UpdateReplyDto } from './reply.dto';
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

    await prisma.reply.delete({
      where: { id },
    });

    return { success: true, message: 'Reply deleted successfully' };
  }
}
