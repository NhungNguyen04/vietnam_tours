-- CreateEnum
CREATE TYPE "Category" AS ENUM ('natural', 'historical', 'cultural', 'religious', 'urban', 'beach', 'mountain', 'adventure', 'resort', 'other');

-- CreateEnum
CREATE TYPE "Province" AS ENUM ('AN_GIANG', 'BA_RIA_VUNG_TAU', 'BAC_GIANG', 'BAC_KAN', 'BAC_LIEU', 'BAC_NINH', 'BEN_TRE', 'BINH_DINH', 'BINH_DUONG', 'BINH_PHUOC', 'BINH_THUAN', 'CA_MAU', 'CAO_BANG', 'DAK_LAK', 'DAK_NONG', 'DIEN_BIEN', 'DONG_NAI', 'DONG_THAP', 'GIA_LAI', 'HA_GIANG', 'HA_NAM', 'HA_TINH', 'HAI_DUONG', 'HAU_GIANG', 'HOA_BINH', 'HUNG_YEN', 'KHANH_HOA', 'KIEN_GIANG', 'KON_TUM', 'LAI_CHAU', 'LAM_DONG', 'LANG_SON', 'LAO_CAI', 'LONG_AN', 'NAM_DINH', 'NGHE_AN', 'NINH_BINH', 'NINH_THUAN', 'PHU_THO', 'PHU_YEN', 'QUANG_BINH', 'QUANG_NAM', 'QUANG_NGAI', 'QUANG_NINH', 'QUANG_TRI', 'SOC_TRANG', 'SON_LA', 'TAY_NINH', 'THAI_BINH', 'THAI_NGUYEN', 'THANH_HOA', 'THUA_THIEN_HUE', 'TIEN_GIANG', 'TRA_VINH', 'TUYEN_QUANG', 'VINH_LONG', 'VINH_PHUC', 'YEN_BAI', 'HA_NOI', 'HAI_PHONG', 'DA_NANG', 'HO_CHI_MINH', 'CAN_THO');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT[],
    "category" "Category" NOT NULL,
    "province" "Province" NOT NULL,
    "district" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
