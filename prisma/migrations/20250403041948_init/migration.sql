/*
  Warnings:

  - You are about to drop the column `image` on the `Location` table. All the data in the column will be lost.
  - Added the required column `coverImage` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "image",
ADD COLUMN     "coverImage" TEXT NOT NULL;
