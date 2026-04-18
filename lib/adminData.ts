// lib/adminData.ts
export interface SupportChat {
  id: string
  customer: string
  lastMessage: string
  unread: number
}

export const supportChats: SupportChat[] = [
  {
    id: '1',
    customer: 'Иван Петров',
    lastMessage: 'Здравствуйте, когда появятся новые модели Trench Crusade?',
    unread: 2,
  },
  {
    id: '2',
    customer: 'Елена Смирнова',
    lastMessage: 'Спасибо, заказ получила!',
    unread: 0,
  },
  {
    id: '3',
    customer: 'Гость (guest@mail.ru)',
    lastMessage: 'Не приходит письмо с подтверждением',
    unread: 1,
  },
]