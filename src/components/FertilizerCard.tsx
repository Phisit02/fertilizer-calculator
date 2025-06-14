
import React from 'react';
import { MaterialInfo, Nutrient } from '../types';

interface FertilizerCardProps {
  fertilizer: MaterialInfo;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const NutrientPill: React.FC<{ nutrient: Nutrient; value: number }> = ({ nutrient, value }) => (
  <span className="text-xs bg-lime-100 text-lime-700 px-2.5 py-1 rounded-full mr-1.5 mb-1.5 inline-block font-medium">
    {nutrient.replace('2O5', '₂O₅').replace('K2O', 'K₂O')}: {value}%
  </span>
);

export const FertilizerCard: React.FC<FertilizerCardProps> = ({ fertilizer, isSelected, onToggleSelect }) => {
  const nValue = Math.round(fertilizer.composition[Nutrient.N] || 0);
  const pValue = Math.round(fertilizer.composition[Nutrient.P2O5] || 0);
  const kValue = Math.round(fertilizer.composition[Nutrient.K2O] || 0);
  
  let npkStringDisplay = "";
  // Display NPK string if it's a mother fertilizer,
  // or if it's not a mother fertilizer but has N, P, or K values.
  if (fertilizer.isMotherFertilizer || (!fertilizer.isMotherFertilizer && (nValue > 0 || pValue > 0 || kValue > 0))
     ) {
    npkStringDisplay = `(${nValue}-${pValue}-${kValue})`;
  }

  const displayName = `${fertilizer.name} ${npkStringDisplay}`.trim();
  const displayNameTh = `${fertilizer.nameTh} ${npkStringDisplay}`.trim();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      className={`p-4 border rounded-xl shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:shadow-xl hover:scale-[1.03] transform ${
        isSelected ? 'bg-green-50 border-green-500 ring-2 ring-green-500 ring-offset-1' : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      onClick={() => onToggleSelect(fertilizer.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleSelect(fertilizer.id); }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-md font-semibold text-green-700">{displayName}</h3>
          <p className="text-sm text-slate-500 mb-1">{displayNameTh}</p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          readOnly // Card click handles logic
          className="form-checkbox h-5 w-5 text-green-600 rounded border-slate-300 focus:ring-green-500 focus:ring-offset-1"
          aria-label={`Select ${fertilizer.name}`}
          tabIndex={-1} 
        />
      </div>
      {fertilizer.description && <p className="text-xs text-slate-500 mt-1 mb-3">{fertilizer.description}</p>}
      <div className="mt-2 border-t border-slate-100 pt-2">
        <p className="text-xs font-medium text-slate-600 mb-1.5">ส่วนประกอบหลัก:</p>
        {Object.entries(fertilizer.composition)
          .filter(([key, value]) => (value ?? 0) > 0)
          .map(([key, value]) => (
            <NutrientPill key={key} nutrient={key as Nutrient} value={value as number} />
        ))}
      </div>
    </div>
  );
};
