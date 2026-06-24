import { randomBytes } from 'crypto'

const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomChar(): string {
  const bytes = randomBytes(1)
  return ALPHANUM[bytes[0] % ALPHANUM.length]
}

export function generateReservationToken(): string {
  const suffix = Array.from({ length: 4 }, () => randomChar()).join('')
  return `MJ-${suffix}`
}
