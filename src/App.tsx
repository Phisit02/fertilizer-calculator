import React, { useState, useCallback, useMemo } from 'react';
import {
  NutrientComposition,
  CalculationResult,
  Nutrient,
  ALL_NUTRIENTS_ORDERED,
} from './types';
import { MOTHER_FERTILIZERS, OTHER_MATERIALS_LIST } from './constants';
import { TargetFormulaForm } from './components/TargetFormulaForm';
import { MaterialSelection } from './components/MaterialSelection';
import { ResultsDisplay } from './components/ResultsDisplay';
import { calculateFertilizerMix } from './services/fertilizerCalculationService';

const initialTargetFormula: NutrientComposition = {};
ALL_NUTRIENTS_ORDERED.forEach(nutrient => {
  if (nutrient === Nutrient.N || nutrient === Nutrient.P2O5 || nutrient === Nutrient.K2O) {
    initialTargetFormula[nutrient] = 15; // Default NPK to 15-15-15
  } else {
    initialTargetFormula[nutrient] = 0;
  }
});


const App: React.FC = () => {
  const [targetFormula, setTargetFormula] = useState<NutrientComposition>(initialTargetFormula);
  const [totalMixWeight, setTotalMixWeight] = useState<number>(100);
  const [selectedMotherFertilizerIds, setSelectedMotherFertilizerIds] = useState<string[]>([]);
  const [selectedOtherMaterialIds, setSelectedOtherMaterialIds] = useState<string[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleToggleMotherFertilizer = useCallback((id: string) => {
    setSelectedMotherFertilizerIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
    setCalculationResult(null); // Clear previous results on selection change
  }, []);

  const handleToggleOtherMaterial = useCallback((id: string) => {
    setSelectedOtherMaterialIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
    setCalculationResult(null);
  }, []);

  const selectedMaterials = useMemo(() => {
    const mothers = MOTHER_FERTILIZERS.filter(f => selectedMotherFertilizerIds.includes(f.id));
    const others = OTHER_MATERIALS_LIST.filter(m => selectedOtherMaterialIds.includes(m.id));
    return [...mothers, ...others];
  }, [selectedMotherFertilizerIds, selectedOtherMaterialIds]);

  const handleCalculate = useCallback(() => {
    setIsLoading(true);
    setCalculationResult(null);

    // Simulate a short delay for loading state visibility if needed
    // setTimeout(() => {
      const result = calculateFertilizerMix(selectedMaterials, targetFormula, totalMixWeight);
      setCalculationResult(result);
      setIsLoading(false);
    // }, 50); 
  }, [selectedMaterials, targetFormula, totalMixWeight]);

  const canCalculate = selectedMaterials.length > 0 && totalMixWeight > 0 && ALL_NUTRIENTS_ORDERED.some(n => (targetFormula[n] ?? 0) > 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700">เครื่องคำนวณสูตรปุ๋ย</h1>
        <p className="text-neutral-600 mt-2 text-md sm:text-lg">
          ออกแบบสูตรปุ๋ยตามความต้องการของคุณ ด้วยแม่ปุ๋ยและวัสดุปรับปรุงดินหลากหลายชนิด
        </p>
      </header>

      <div className="space-y-8">
        <TargetFormulaForm
          targetFormula={targetFormula}
          setTargetFormula={setTargetFormula}
          totalMixWeight={totalMixWeight}
          setTotalMixWeight={setTotalMixWeight}
        />

        <MaterialSelection
          title="2. เลือกแม่ปุ๋ย (แหล่ง N-P-K หลัก)"
          materials={MOTHER_FERTILIZERS}
          selectedIds={selectedMotherFertilizerIds}
          onToggleSelect={handleToggleMotherFertilizer}
        />

        <MaterialSelection
          title="3. เลือกวัสดุอื่น ๆ (แหล่งธาตุรอง, จุลธาตุ, ปรับปรุงดิน)"
          materials={OTHER_MATERIALS_LIST}
          selectedIds={selectedOtherMaterialIds}
          onToggleSelect={handleToggleOtherMaterial}
        />

        <div className="text-center pt-4">
          <button
            onClick={handleCalculate}
            disabled={isLoading || !canCalculate}
            className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "คำนวณสูตรปุ๋ย"}
          </button>
        </div>

        <ResultsDisplay result={calculationResult} targetFormula={targetFormula} totalMixWeight={totalMixWeight} />
      </div>

      <footer className="text-center mt-12 py-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-500">
          Fertilizer Calculator &copy; {new Date().getFullYear()}. เพื่อการศึกษาและประมาณการเท่านั้น
        </p>
      </footer>
    </div>
  );
};

export default App;
