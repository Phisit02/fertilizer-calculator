import React from 'react';
import { MaterialInfo, Nutrient } from '../types';

interface MaterialCardProps {
  material: MaterialInfo;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, isSelected, onToggleSelect }) => {
  const bgColor = isSelected ? 'bg-green-100 border-green-500 ring-2 ring-green-400' : 'bg-white border-neutral-200 hover:border-neutral-300';
  
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      className={`p-4 border rounded-lg shadow-md transition-all duration-200 ease-in-out cursor-pointer ${bgColor}`}
      onClick={() => onToggleSelect(material.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleSelect(material.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-md font-semibold text-green-700">{material.name} {material.npkDisplay && `(${material.npkDisplay})`}</h4>
          <p className="text-sm text-neutral-600">{material.nameTh}</p>
          {material.chemicalFormula && <p className="text-xs text-neutral-500 italic">{material.chemicalFormula}</p>}
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="form-checkbox h-5 w-5 text-green-600 rounded border-neutral-300 focus:ring-green-500 focus:ring-offset-0"
          aria-label={`เลือก ${material.name}`}
          tabIndex={-1}
        />
      </div>
      {material.description && <p className="text-xs text-neutral-500 mt-1 mb-2">{material.description}</p>}
      <div className="mt-2 border-t border-neutral-100 pt-2 space-x-1 space-y-1">
        <span className="text-xs font-medium text-neutral-600">ส่วนประกอบ:</span>
        {Object.entries(material.composition)
          .filter(([, value]) => (value ?? 0) > 0)
          .map(([key, value]) => (
            <span
              key={key}
              className="text-xs bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full inline-block"
            >
              {key as Nutrient}: {value}%
            </span>
        ))}
      </div>
    </div>
  );
};


interface MaterialSelectionProps {
  title: string;
  materials: MaterialInfo[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export const MaterialSelection: React.FC<MaterialSelectionProps> = ({ title, materials, selectedIds, onToggleSelect }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-green-700 mb-4">{title}</h3>
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              isSelected={selectedIds.includes(material.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">ไม่พบข้อมูลวัสดุ</p>
      )}
    </div>
  );
};
