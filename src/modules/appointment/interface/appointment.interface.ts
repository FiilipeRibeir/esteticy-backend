import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import { z } from 'zod';

export const AppointmentCreateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  date: z.coerce.date(),
  workId: z.string().uuid('Invalid work ID'),
  email: z.string().email('Invalid email'),
});

export const AppointmentDeleteSchema = z.object({
  id: z.string().uuid('Invalid appointment ID'),
});

export const AppointmentGetSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  date: z.coerce.date().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export const AppointmentUpdateSchema = z.object({
  id: z.string().uuid('Invalid appointment ID'),
  date: z.coerce.date().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paidAmount: z.number().nonnegative().optional(),
});

export type AppointmentCreateProps = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentDeleteProps = z.infer<typeof AppointmentDeleteSchema>;
export type AppointmentGetProps = z.infer<typeof AppointmentGetSchema>;
export type AppointmentUpdateProps = z.infer<typeof AppointmentUpdateSchema>;
