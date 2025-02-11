import { z } from "zod";

export const ClientLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email')
    .regex(/@gmail\.com$/, 'Email must end with @gmail.com'),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone inválido"),
});

export type ClientLoginProps = z.infer<typeof ClientLoginSchema>;
