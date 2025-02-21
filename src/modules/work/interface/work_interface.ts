import { z } from 'zod';

export const WorkCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be a positive number'),
});

export const WorkDeleteSchema = z.object({
  id: z.string().min(1, 'Work ID is required'),
});

export const WorkGetOneSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const WorkUpdateSchema = z.object({
  id: z.string().min(1, 'Work ID is required'),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
});

export type WorkCreateProps = z.infer<typeof WorkCreateSchema>;
export type WorkDeleteProps = z.infer<typeof WorkDeleteSchema>;
export type WorkGetOneProps = z.infer<typeof WorkGetOneSchema>;
export type WorkUpdateProps = z.infer<typeof WorkUpdateSchema>;
