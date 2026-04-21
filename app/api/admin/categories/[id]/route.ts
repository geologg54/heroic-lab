// app/api/admin/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... проверка прав
  const { id } = await params
  const data = await request.json()
  const { 
    name, slug, image, parentId,
    filter1Name, filter2Name, filter3Name, filter4Name, filter5Name // 🆕
  } = data

  const category = await prisma.category.update({
    where: { id },
    data: { 
      name, slug, image, parentId,
      filter1Name, filter2Name, filter3Name, filter4Name, filter5Name // 🆕
    }
  })

  return NextResponse.json(category)
}