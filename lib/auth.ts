import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nurishlink-secret'
)

export interface JWTPayload {
  sub: string   // user id as string
  role: string
  iat?: number
  exp?: number
}

export async function signToken(payload: { sub: number; role: string }): Promise<string> {
  return await new SignJWT({ sub: String(payload.sub), role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as JWTPayload
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
