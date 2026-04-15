// components/product/ProductTabs.tsx
'use client'
import { useState } from 'react'
import { Product } from '@/types'

export const ProductTabs = ({ product }: { product: Product }) => {
  const [activeTab, setActiveTab] = useState('description')
  const tabs = [
    { id: 'description', label: 'Описание' },
    { id: 'specs', label: 'Характеристики' },
    { id: 'files', label: 'Файлы в комплекте' },
    { id: 'compatibility', label: 'Совместимость' },
  ]
  return (
    <div className="mt-8">
      <div className="flex border-b border-borderLight gap-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-2 px-1 ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}>{tab.label}</button>
        ))}
      </div>
      <div className="mt-4 text-gray-300">
        {activeTab === 'description' && <p>{product.description}</p>}
        {activeTab === 'specs' && (
          <ul className="list-disc pl-5 space-y-1">
            <li>Масштаб: {product.scale}</li>
            <li>Тип модели: {product.type}</li>
            <li>Фракция: {product.faction || 'Общая'}</li>
            <li>Формат: {product.fileFormat}</li>
          </ul>
        )}
        {activeTab === 'files' && <p>В комплекте: STL файлы модели, предварительно поддержанные версии, инструкция по печати.</p>}
        {activeTab === 'compatibility' && <p>Модель подходит для {product.gameSystem} и любых настольных варгеймов в масштабе {product.scale}.</p>}
      </div>
    </div>
  )
}
