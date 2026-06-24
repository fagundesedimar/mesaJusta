import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['DONOR', 'ONG', 'ADMIN'], { message: 'Papel inválido' }),
  document: z.string().min(1, 'Documento é obrigatório'),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos numéricos'),
})

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
