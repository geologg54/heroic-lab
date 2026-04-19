// lib/auth.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Проверяет, что текущий пользователь является администратором.
 * Если нет — возвращает ответ 403 Forbidden.
 * 
 * @returns Сессию пользователя, если он админ, иначе выбрасывает ответ 403.
 * Использование:
 *   const session = await requireAdmin()
 *   // если выполнение дошло сюда, значит пользователь админ
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    // Возвращаем ошибку 403 (доступ запрещён)
    throw NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })
  }
  
  return session
}