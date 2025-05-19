/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "coverImage",
ADD COLUMN     "images" TEXT[];
