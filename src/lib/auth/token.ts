import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production')
const TTL = '8h'
const REFRESH_TTL = '7d'

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

export async function signRefreshToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(REFRESH_SECRET)
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}
