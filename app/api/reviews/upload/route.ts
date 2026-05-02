// app/api/reviews/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const MAX_SIZE = 10 * 1024 * 1024; // 10 МБ
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Файлы не найдены' }, { status: 400 });
    }
    if (files.length > 3) {
      return NextResponse.json({ error: 'Максимум 3 изображения' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'feedback');
    // Создаём папку, если её нет
    await mkdir(uploadDir, { recursive: true });

    const savedPaths: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Недопустимый тип файла: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Файл ${file.name} превышает 10 МБ` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Генерируем уникальное имя
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      savedPaths.push(`/images/feedback/${filename}`);
    }

    return NextResponse.json({ paths: savedPaths });
  } catch (error) {
    console.error('Ошибка загрузки изображений:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}