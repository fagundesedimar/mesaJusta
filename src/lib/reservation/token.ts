import { randomBytes } from 'crypto'

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomChar(): string {
  const bytes = randomBytes(1)
  return ALPHANUM[bytes[0] % ALPHANUM.length]
}

export function generateReservationToken(): string {
  return Array.from({ length: 6 }, () => randomChar()).join('')
}
