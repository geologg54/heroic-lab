// components/product/MaterialProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface Material {
  id: string;
  name: string;
  description?: string | null;
  priceMultiplier: number;
  isDefault: boolean;
}

interface MaterialContextValue {
  materials: Material[];
  selectedMaterial: Material | null;
  defaultMaterial: Material | null; // новый – материал по умолчанию
  finalPrice: number;
  openModal: () => void;
}

const MaterialContext = createContext<MaterialContextValue>({
  materials: [],
  selectedMaterial: null,
  defaultMaterial: null,
  finalPrice: 0,
  openModal: () => {},
});

export const useMaterial = () => useContext(MaterialContext);

export function MaterialProvider({
  children,
  basePrice,
}: {
  children: ReactNode;
  basePrice: number;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [defaultMaterial, setDefaultMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/materials')
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);
        const def = data.find((m: Material) => m.isDefault) || data[0];
        setDefaultMaterial(def || null);
        setSelectedMaterial(def || null); // изначально выбран дефолтный
      })
      .catch(console.error);
  }, []);

  const finalPrice = Math.round(basePrice * (selectedMaterial?.priceMultiplier ?? 1));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <MaterialContext.Provider
      value={{ materials, selectedMaterial, defaultMaterial, finalPrice, openModal }}
    >
      {children}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70"
          onClick={closeModal}
        >
          <div
            className="bg-cardbg border border-borderLight rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Выберите материал</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {materials.map((mat) => {
                const percent = Math.round((mat.priceMultiplier - 1) * 100);
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setSelectedMaterial(mat);
                      closeModal();
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedMaterial?.id === mat.id
                        ? 'border-accent bg-accent/10'
                        : 'border-borderLight hover:border-accent'
                    }`}
                  >
                    <div className="text-white font-semibold">{mat.name}</div>
                    {mat.description && (
                      <div className="text-gray-400 text-sm mt-1">{mat.description}</div>
                    )}
                    <div className="text-gray-300 text-sm mt-1">
                      Стоимость {percent > 0 ? `+${percent}%` : 'без наценки'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </MaterialContext.Provider>
  );
}