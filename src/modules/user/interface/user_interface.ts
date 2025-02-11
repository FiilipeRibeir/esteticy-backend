import { z } from 'zod';

export const UserCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .email('Invalid email')
    .regex(/@gmail\.com$/, 'Email must end with @gmail.com'),
  nickname: z.string().min(1, 'Nickname is required'),
  status: z.boolean().default(true),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z
    .string()
    .email('Invalid email')
    .regex(/@gmail\.com$/, 'Email must end with @gmail.com')
    .optional(),
  nickname: z.string().min(1, 'Nickname is required').optional(),
  status: z.boolean().default(true).optional(),
});

export type UserUpdateProps = z.infer<typeof UserUpdateSchema> & { id: string }; 
export type UserCreateProps = z.infer<typeof UserCreateSchema>;
