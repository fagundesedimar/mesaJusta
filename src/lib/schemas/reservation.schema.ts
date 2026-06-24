import { z } from 'zod'

export const ConfirmDeliverySchema = z.object({
  donationId: z.string().uuid('ID de doação inválido'),
  token: z.string().length(6, 'O token deve ter exatamente 6 caracteres'),
})

export type ConfirmDeliveryInput = z.infer<typeof ConfirmDeliverySchema>

export const CreateReservationSchema = z.object({
  donationId: z.string().uuid('ID de doação inválido'),
})

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>

export const CancelReservationSchema = z.object({
  donationId: z.string().uuid('ID de doação inválido'),
})

export type CancelReservationInput = z.infer<typeof CancelReservationSchema>
