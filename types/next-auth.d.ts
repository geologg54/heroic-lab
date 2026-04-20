// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    twoFactorEnabled?: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role?: string
      twoFactorEnabled?: boolean
      twoFactorVerified?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    twoFactorEnabled?: boolean
    twoFactorVerified?: boolean
  }
}