// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials, req) {
  // --- ЗАЩИТА ОТ БРУТФОРСА ---
  // Получаем IP-адрес из заголовков
  const forwarded = req?.headers?.['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : (req?.headers?.['x-real-ip'] as string) || 'unknown';

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    logger.warn(`Попытка входа с заблокированного IP: ${ip}`, { email: credentials?.email });
    throw new Error(rateLimit.message);
  }

  // Проверяем, что email и пароль переданы
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  // Ищем пользователя
  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });

  if (!user || !user.password) {
    logger.warn(`Неудачная попытка входа: email ${credentials.email} не найден`, { ip });
    return null;
  }

  const passwordMatch = await bcrypt.compare(credentials.password, user.password);
  if (!passwordMatch) {
    logger.warn(`Неудачная попытка входа: неверный пароль для ${credentials.email}`, { ip });
    return null;
  }

  logger.info(`Успешный вход: ${user.email}`, { ip });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.twoFactorEnabled = user.twoFactorEnabled || false
        token.twoFactorVerified = false // изначально не подтверждено
      }
      // Если сессия обновляется с флагом twoFactorVerified
      if (trigger === "update" && session?.twoFactorVerified) {
        token.twoFactorVerified = true
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean
        session.user.twoFactorVerified = token.twoFactorVerified as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }