import { z } from 'zod'

export const ConfirmDeliverySchema = z.object({
  donationId: z.string().uuid('ID de doação inválido'),
  token: z.string().length(6, 'O token deve ter exatamente 6 caracteres'),
})

export type ConfirmDeliveryInput = z.infer<typeof ConfirmDeliverySchema>
