
import React from 'react';
import { CalculationResult, NutrientComposition, Nutrient, NUTRIENT_DISPLAY_CATEGORIES } from '../types';
import { NUTRIENT_LABELS_TH } from '../constants';

interface ResultsDisplayProps {
  result: CalculationResult | null;
  targetFormula: NutrientComposition;
  totalMixWeight: number;
}

const NutrientRowDisplay: React.FC<{
  nutrient: Nutrient;
  targetKg: number;
  actualKg: number;
  actualPercent: number;
  category: 'primary' | 'other';
}> = ({ nutrient, targetKg, actualKg, actualPercent, category }) => {
  const rowBg = category === 'primary' ? 'bg-green-50' : 'bg-lime-50';
  const labelColor = category === 'primary' ? 'text-green-700 font-semibold' : 'text-lime-700 font-semibold';

  return (
    <tr className={`${rowBg} hover:bg-neutral-100 transition-colors`}>
      <td className={`py-2 px-3 text-sm ${labelColor}`}>{NUTRIENT_LABELS_TH[nutrient]}</td>
      <td className="py-2 px-3 text-sm text-neutral-600 text-right tabular-nums">
        {(targetKg > 1e-6 || actualKg > 1e-6 || nutrient === Nutrient.N || nutrient === Nutrient.P2O5 || nutrient === Nutrient.K2O) ? targetKg.toFixed(3) : '-'}
      </td>
      <td className="py-2 px-3 text-sm text-neutral-600 text-right tabular-nums">
         {(targetKg > 1e-6 || actualKg > 1e-6 || nutrient === Nutrient.N || nutrient === Nutrient.P2O5 || nutrient === Nutrient.K2O) ? actualKg.toFixed(3) : '-'}
      </td>
      <td className="py-2 px-3 text-sm text-neutral-600 text-right tabular-nums">
         {(targetKg > 1e-6 || actualKg > 1e-6 || nutrient === Nutrient.N || nutrient === Nutrient.P2O5 || nutrient === Nutrient.K2O) ? actualPercent.toFixed(3) : '-'}
      </td>
    </tr>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, targetFormula, totalMixWeight }) => {
  if (!result) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg mt-8" aria-live="polite">
        <h3 className="text-xl font-semibold text-green-700 mb-2">4. ผลลัพธ์การคำนวณ</h3>
        <p className="text-neutral-500">กรุณากรอกข้อมูล เลือกวัสดุ และกด "คำนวณ" เพื่อดูผลลัพธ์</p>
      </div>
    );
  }

  const { recipe, finalNutrientProfileKg, finalNutrientProfilePercent, totalActiveIngredientWeight, fillerNeededKg, warnings, errors } = result;

  const targetNutrientsKg: NutrientComposition = {};
  Object.entries(targetFormula).forEach(([key, val]) => {
    targetNutrientsKg[key as Nutrient] = (val / 100) * totalMixWeight;
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-8 space-y-6" aria-live="polite">
      <h3 className="text-xl font-semibold text-green-700">4. ผลลัพธ์การคำนวณ</h3>

      {errors.length > 0 && (
        <div role="alert" className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          <h4 className="font-bold mb-1 text-red-800">ข้อผิดพลาด:</h4>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {errors.map((err, index) => <li key={index}>{err}</li>)}
          </ul>
        </div>
      )}

      {recipe.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-2">ปริมาณวัสดุที่ต้องใช้:</h4>
          <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 overflow-hidden">
            {recipe.map(({ material, amount }) => (
              <li key={material.id} className="px-3 py-2 flex justify-between items-center hover:bg-neutral-50 transition-colors bg-white">
                <span className="text-sm font-medium text-neutral-700">{material.name} ({material.nameTh})</span>
                <span className="text-sm text-green-600 font-semibold tabular-nums">{amount.toFixed(3)} กก.</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm font-semibold text-neutral-800">
            น้ำหนักรวมของวัสดุที่ใช้งานจริง: <span className="tabular-nums">{totalActiveIngredientWeight.toFixed(2)}</span> กก.
          </p>
          {fillerNeededKg > 1e-3 && (
            <p className="mt-1 text-xs text-sky-600">
              (อาจต้องใช้สารตัวเติม: <span className="tabular-nums">{fillerNeededKg.toFixed(2)}</span> กก. เพื่อให้ได้น้ำหนักรวม {totalMixWeight.toFixed(2)} กก.)
            </p>
          )}
        </div>
      )}

      {Object.keys(finalNutrientProfileKg).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-neutral-700 mb-2 mt-4">สรุปปริมาณธาตุอาหารในสูตรผสม (ต่อน้ำหนักรวม {totalMixWeight.toFixed(2)} กก.):</h4>
          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <caption className="sr-only">ตารางสรุปปริมาณธาตุอาหารเป้าหมายและที่ได้จริง</caption>
              <thead className="bg-neutral-100">
                <tr>
                  <th scope="col" className="py-2 px-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">ธาตุอาหาร</th>
                  <th scope="col" className="py-2 px-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">เป้าหมาย (กก.)</th>
                  <th scope="col" className="py-2 px-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">ที่ได้จริง (กก.)</th>
                  <th scope="col" className="py-2 px-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">ที่ได้จริง (%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {NUTRIENT_DISPLAY_CATEGORIES.primary.map(nutrientKey => (
                  <NutrientRowDisplay
                    key={`primary-${nutrientKey}`}
                    nutrient={nutrientKey}
                    targetKg={targetNutrientsKg[nutrientKey] ?? 0}
                    actualKg={finalNutrientProfileKg[nutrientKey] ?? 0}
                    actualPercent={finalNutrientProfilePercent[nutrientKey] ?? 0}
                    category='primary'
                  />
                ))}
                {NUTRIENT_DISPLAY_CATEGORIES.other
                  .filter(n => (targetNutrientsKg[n] ?? 0) > 1e-6 || (finalNutrientProfileKg[n] ?? 0) > 1e-6)
                  .map(nutrientKey => (
                  <NutrientRowDisplay
                    key={`other-${nutrientKey}`}
                    nutrient={nutrientKey}
                    targetKg={targetNutrientsKg[nutrientKey] ?? 0}
                    actualKg={finalNutrientProfileKg[nutrientKey] ?? 0}
                    actualPercent={finalNutrientProfilePercent[nutrientKey] ?? 0}
                    category='other'
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div role="alert" className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md mt-4">
          <h4 className="font-bold mb-1 text-yellow-800">ข้อควรทราบ / คำแนะนำ:</h4>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {warnings.map((warn, index) => <li key={index}>{warn}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
