import React from 'react';
import { Nutrient, NutrientComposition, ALL_NUTRIENTS_ORDERED } from '../types';
import { NUTRIENT_LABELS_TH } from '../constants';

interface TargetFormulaFormProps {
  targetFormula: NutrientComposition;
  setTargetFormula: React.Dispatch<React.SetStateAction<NutrientComposition>>;
  totalMixWeight: number;
  setTotalMixWeight: React.Dispatch<React.SetStateAction<number>>;
}

const NutrientInput: React.FC<{
  nutrient: Nutrient;
  value: number;
  onChange: (nutrient: Nutrient, value: number) => void;
}> = ({ nutrient, value, onChange }) => {
  const max = (nutrient === Nutrient.B || nutrient === Nutrient.Zn) ? 5 : 100;
  const step = (nutrient === Nutrient.B || nutrient === Nutrient.Zn) ? 0.01 : 1;
  return (
    <div>
      <label htmlFor={`nutrient-${nutrient}`} className="block text-sm font-medium text-neutral-700">
        {NUTRIENT_LABELS_TH[nutrient]}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="number"
          id={`nutrient-${nutrient}`}
          name={`nutrient-${nutrient}`}
          value={value}
          onChange={(e) => onChange(nutrient, parseFloat(e.target.value) || 0)}
          min="0"
          max={max}
          step={step}
          className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-neutral-300 rounded-md p-2"
          aria-label={`Target percentage for ${nutrient}`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-neutral-500 sm:text-sm">%</span>
        </div>
      </div>
    </div>
  );
};

export const TargetFormulaForm: React.FC<TargetFormulaFormProps> = ({
  targetFormula,
  setTargetFormula,
  totalMixWeight,
  setTotalMixWeight,
}) => {
  const handleNutrientChange = (nutrient: Nutrient, value: number) => {
    const max = (nutrient === Nutrient.B || nutrient === Nutrient.Zn) ? 5 : 100;
    setTargetFormula(prev => ({ ...prev, [nutrient]: Math.max(0, Math.min(max, value)) }));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h3 className="text-xl font-semibold text-green-700">1. กำหนดสูตรปุ๋ยและน้ำหนักรวม</h3>
      
      <p className="text-sm text-neutral-600">กำหนดเปอร์เซ็นต์ธาตุอาหารที่ต้องการในสูตรผสม:</p>
      <div className="nutrient-input-grid">
        {ALL_NUTRIENTS_ORDERED.map(nutrient => (
          <NutrientInput
            key={nutrient}
            nutrient={nutrient}
            value={targetFormula[nutrient] || 0}
            onChange={handleNutrientChange}
          />
        ))}
      </div>

      <div>
        <label htmlFor="totalMixWeight" className="block text-sm font-medium text-neutral-700 mt-4">
          น้ำหนักรวมของสูตรปุ๋ยทั้งหมดที่ต้องการ
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            id="totalMixWeight"
            name="totalMixWeight"
            value={totalMixWeight}
            onChange={(e) => setTotalMixWeight(Math.max(0, parseFloat(e.target.value) || 0))}
            min="0"
            step="1"
            className="focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-neutral-300 rounded-md p-2"
            aria-label="Total mix weight in kilograms"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-500 sm:text-sm">กก.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
