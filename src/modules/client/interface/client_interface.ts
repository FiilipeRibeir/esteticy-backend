import { z } from "zod";

export const ClientCreateSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone inválido"),
});

export const ClientUpdateSchema = z.object({
  name: z.string().min(2, "Nome muito curto").optional(), 
  email: z.string().email("E-mail inválido").optional(), 
  phone: z.string().regex(/^\d{10,11}$/, "Telefone inválido").optional(), 
});

export type ClientCreateProps = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateProps = z.infer<typeof ClientUpdateSchema> & { id: string };
