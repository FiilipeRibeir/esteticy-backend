import { z } from "zod";

export const ClientLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email')
    .regex(/@gmail\.com$/, 'Email must end with @gmail.com'),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone inválido"),
});

export const UserLoginSchema = z.object({
  idToken: z.string().min(10, "ID Token inválido"),
});

export type ClientLoginProps = z.infer<typeof ClientLoginSchema>;
export type UserLoginProps = z.infer<typeof UserLoginSchema>;