import { Module } from '@nestjs/common';
import { BlogSaveController } from './blogSave.controller';
import { BlogSaveService } from './blogSave.service';

@Module({
  imports: [],
  controllers: [BlogSaveController],
  providers: [BlogSaveService],
  exports: [BlogSaveService],
})
export class BlogSaveModule {}
