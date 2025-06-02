import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createOAuthSchema = createUserSchema.omit({ password: true });
export type CreateOAuthInput = z.infer<typeof createOAuthSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  image: z.string().url({ message: 'Invalid URL format' }).optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createTourSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  duration: z.number().int().positive({ message: 'Duration must be a positive integer' }),
  maxCapacity: z.number().int().positive({ message: 'Maximum capacity must be a positive integer' }),
  images: z.array(z.string().url({ message: 'Invalid URL format' })).optional(),
  itinerary: z.string().min(1, { message: 'Itinerary is required' }),
  includes: z.string().optional(),
  excludes: z.string().optional(),
  startDates: z.array(z.coerce.date()),
  locationId: z.string().optional(),
  category: z.enum(['natural', 'historical', 'cultural', 'religious', 'urban', 
    'beach', 'mountain', 'adventure', 'resort', 'other']).optional(),
  province: z.enum([
    'AN_GIANG', 'BA_RIA_VUNG_TAU', 'BAC_GIANG', 'BAC_KAN', 'BAC_LIEU', 'BAC_NINH', 
    'BEN_TRE', 'BINH_DINH', 'BINH_DUONG', 'BINH_PHUOC', 'BINH_THUAN', 'CA_MAU', 
    'CAO_BANG', 'DAK_LAK', 'DAK_NONG', 'DIEN_BIEN', 'DONG_NAI', 'DONG_THAP', 
    'GIA_LAI', 'HA_GIANG', 'HA_NAM', 'HA_TINH', 'HAI_DUONG', 'HAU_GIANG', 
    'HOA_BINH', 'HUNG_YEN', 'KHANH_HOA', 'KIEN_GIANG', 'KON_TUM', 'LAI_CHAU', 
    'LAM_DONG', 'LANG_SON', 'LAO_CAI', 'LONG_AN', 'NAM_DINH', 'NGHE_AN', 
    'NINH_BINH', 'NINH_THUAN', 'PHU_THO', 'PHU_YEN', 'QUANG_BINH', 'QUANG_NAM', 
    'QUANG_NGAI', 'QUANG_NINH', 'QUANG_TRI', 'SOC_TRANG', 'SON_LA', 'TAY_NINH', 
    'THAI_BINH', 'THAI_NGUYEN', 'THANH_HOA', 'THUA_THIEN_HUE', 'TIEN_GIANG', 
    'TRA_VINH', 'TUYEN_QUANG', 'VINH_LONG', 'VINH_PHUC', 'YEN_BAI', 'HA_NOI', 
    'HAI_PHONG', 'DA_NANG', 'HO_CHI_MINH', 'CAN_THO'
  ]).optional(),
  district: z.string().optional(),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;

export const updateTourSchema = createTourSchema.partial();
export type UpdateTourInput = z.infer<typeof updateTourSchema>;

export const createTourBookingSchema = z.object({
  tourId: z.string(),
  bookingDate: z.coerce.date(),
  participants: z.number().int().positive().default(1),
  notes: z.string().optional(),
});

export type CreateTourBookingInput = z.infer<typeof createTourBookingSchema>;

export const updateTourBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  participants: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type UpdateTourBookingInput = z.infer<typeof updateTourBookingSchema>;

export const createTourReviewSchema = z.object({
  tourId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateTourReviewInput = z.infer<typeof createTourReviewSchema>;

export const updateTourReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export type UpdateTourReviewInput = z.infer<typeof updateTourReviewSchema>;


