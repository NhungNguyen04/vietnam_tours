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
