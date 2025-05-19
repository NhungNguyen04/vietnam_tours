-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "category" "Category",
ADD COLUMN     "district" TEXT,
ADD COLUMN     "province" "Province",
ALTER COLUMN "locationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TourReview" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TourReview_tourId_userId_key" ON "TourReview"("tourId", "userId");
