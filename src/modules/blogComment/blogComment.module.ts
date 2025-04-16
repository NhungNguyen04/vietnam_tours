import { Module } from '@nestjs/common';
import { BlogCommentController } from './blogComment.controller';
import { BlogCommentService } from './blogComment.service';

@Module({
  controllers: [BlogCommentController],
  providers: [BlogCommentService],
  exports: [BlogCommentService],
})
export class BlogCommentModule {}
