// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions, type User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { checkRateLimit } from '@/lib/rate-limit' // <-- Подключаем защиту от брутфорса
import { logger } from '@/lib/logger'             // <-- Подключаем логгер

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
        // Получаем IP-адрес пользователя, который пытается войти.
        // req содержит информацию о запросе.
        // @ts-ignore – игнорируем ошибку типов, потому что в реальности поля есть.
        const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
                   // @ts-ignore
                   req?.socket?.remoteAddress || 
                   'unknown'
        
        // Проверяем, не превышен ли лимит попыток с этого IP.
        const rateLimit = checkRateLimit(ip)
        if (!rateLimit.allowed) {
          // Если лимит превышен, записываем предупреждение в лог
          logger.warn(`Попытка входа с заблокированного IP: ${ip}`, { email: credentials?.email })
          // и выбрасываем ошибку с сообщением, которое увидит пользователь.
          throw new Error(rateLimit.message)
        }

        // Проверяем, что email и пароль вообще переданы
        if (!credentials?.email || !credentials?.password) {
          return null // если нет – возвращаем null (ошибка авторизации)
        }

        // Ищем пользователя в базе данных по email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        // Если пользователь не найден или у него нет пароля (например, вошёл через соцсети)
        if (!user || !user.password) {
          logger.warn(`Неудачная попытка входа: email ${credentials.email} не найден`, { ip })
          return null
        }

        // Сравниваем введённый пароль с хешем в базе
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          logger.warn(`Неудачная попытка входа: неверный пароль для ${credentials.email}`, { ip })
          return null
        }

        // Успешный вход! Можно записать в лог.
        logger.info(`Успешный вход: ${user.email}`, { ip })
        
        // Возвращаем объект пользователя, который попадёт в сессию
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt", // используем JSON Web Tokens для сессий
  },
  callbacks: {
    // Добавляем роль и ID пользователя в токен
    async jwt({ token, user }: { token: any; user?: User }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    // Прокидываем данные из токена в сессию, чтобы они были доступны на клиенте
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",   // кастомная страница входа
    error: "/login",    // страница с ошибкой (тоже перенаправляем на логин)
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }