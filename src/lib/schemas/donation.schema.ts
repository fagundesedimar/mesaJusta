import { z } from 'zod'

export const CATEGORIES = [
  'Hortifrúti',
  'Panificados',
  'Laticínios',
  'Mercearia',
  'Proteínas',
  'Refeições Prontas',
] as const

export const CreateDonationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum(CATEGORIES, { message: 'Categoria inválida' }),
  weightKg: z.number().positive('Peso deve ser positivo'),
  expiresAt: z.string().refine(
    (val) => new Date(val) >= new Date(new Date().toDateString()),
    { message: 'A data de validade não pode ser anterior a hoje.' }
  ),
  notes: z.string().optional(),
})

export type CreateDonationInput = z.infer<typeof CreateDonationSchema>
