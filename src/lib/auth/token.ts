import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')
const TTL = '8h'

export interface TokenPayload extends JWTPayload {
  sub: string
  email: string
  role: 'DONOR' | 'ONG' | 'ADMIN'
}

export async function signToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}
