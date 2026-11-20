import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),

    email: z
      .string()
      .trim()
      .min(1, "O e-mail é obrigatório.")
      .email("Informe um e-mail válido."),

    phone: z.string().trim().min(1, "O telefone é obrigatório."),

    document: z.string().trim().min(1, "O documento é obrigatório."),

    password: z
      .string()
      .min(8, "A senha deve possuir pelo menos 8 caracteres."),

    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
