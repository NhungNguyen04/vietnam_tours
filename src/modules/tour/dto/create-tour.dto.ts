import { Category, Province } from '@prisma/client';

export class CreateTourDto {
  title: string;
  description: string;
  price: number;
  duration: number;
  maxCapacity: number;
  images: string[];
  itinerary: string;
  includes?: string;
  excludes?: string;
  startDates: Date[];
  agencyId: string;
  locationId?: string;
  category?: Category;
  province?: Province;
  district?: string;
}
