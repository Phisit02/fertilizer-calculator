import {
  MaterialInfo,
  CalculationResult,
  Nutrient,
  NutrientComposition,
  CalculatedAmount,
  NUTRIENT_PRIORITIES_FOR_CALCULATION,
  ALL_NUTRIENTS_ORDERED
} from '../types';

const EPSILON = 1e-6; // Small number for floating point comparisons

export function calculateFertilizerMix(
  selectedMaterials: MaterialInfo[],
  targetFormulaPercent: NutrientComposition,
  totalMixWeightKg: number
): CalculationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (selectedMaterials.length === 0) {
    errors.push("กรุณาเลือกแม่ปุ๋ยหรือวัสดุอื่น ๆ อย่างน้อย 1 ชนิด");
  }
  if (totalMixWeightKg <= 0) {
    errors.push("น้ำหนักรวมของสูตรปุ๋ยต้องมากกว่า 0 กก.");
  }

  const hasTarget = ALL_NUTRIENTS_ORDERED.some(n => (targetFormulaPercent[n] ?? 0) > 0);
  if (!hasTarget) {
    errors.push("กรุณากำหนดเป้าหมายธาตุอาหารอย่างน้อย 1 ชนิด");
  }

  if (errors.length > 0) {
    return {
      recipe: [],
      finalNutrientProfileKg: {},
      finalNutrientProfilePercent: {},
      totalActiveIngredientWeight: 0,
      fillerNeededKg: totalMixWeightKg,
      warnings,
      errors,
    };
  }

  // Target nutrients in kg
  const targetNutrientsKg: NutrientComposition = {};
  ALL_NUTRIENTS_ORDERED.forEach(n => {
    targetNutrientsKg[n] = ((targetFormulaPercent[n] ?? 0) / 100) * totalMixWeightKg;
  });

  const currentSuppliedNutrientsKg: NutrientComposition = {};
  ALL_NUTRIENTS_ORDERED.forEach(n => {
    currentSuppliedNutrientsKg[n] = 0;
  });

  const materialAmountsKg: Map<string, number> = new Map();

  // Greedy algorithm
  for (const nutrient of NUTRIENT_PRIORITIES_FOR_CALCULATION) {
    let neededKg = (targetNutrientsKg[nutrient] ?? 0) - (currentSuppliedNutrientsKg[nutrient] ?? 0);

    if (neededKg <= EPSILON) continue;

    // Find the "best" material for this nutrient among selected ones not yet "fully" used up
    // "Best" can be defined as highest concentration of the current target nutrient.
    let bestMaterial: MaterialInfo | null = null;
    let maxConcentration = 0;

    for (const material of selectedMaterials) {
      const concentration = material.composition[nutrient] ?? 0;
      if (concentration > maxConcentration) {
        maxConcentration = concentration;
        bestMaterial = material;
      }
    }

    if (bestMaterial && maxConcentration > EPSILON) {
      const concentrationDecimal = maxConcentration / 100;
      let amountToAddKg = neededKg / concentrationDecimal;
      
      // Add to recipe
      materialAmountsKg.set(bestMaterial.id, (materialAmountsKg.get(bestMaterial.id) ?? 0) + amountToAddKg);

      // Update supplied nutrients from this added amount
      ALL_NUTRIENTS_ORDERED.forEach(nKey => {
        const suppliedByThisMaterial = amountToAddKg * ((bestMaterial!.composition[nKey] ?? 0) / 100);
        currentSuppliedNutrientsKg[nKey] = (currentSuppliedNutrientsKg[nKey] ?? 0) + suppliedByThisMaterial;
      });
    } else {
      // Only warn if this nutrient was actually targeted
      if ((targetNutrientsKg[nutrient] ?? 0) > EPSILON && neededKg > EPSILON) {
        warnings.push(`ไม่สามารถจัดหาธาตุ ${nutrient} เพิ่มเติมได้จากวัสดุที่เลือก (ต้องการอีก ${neededKg.toFixed(3)} กก.)`);
      }
    }
  }

  const recipe: CalculatedAmount[] = [];
  let totalActiveIngredientWeight = 0;
  materialAmountsKg.forEach((amount, id) => {
    const material = selectedMaterials.find(m => m.id === id);
    if (material && amount > EPSILON) {
      recipe.push({ material, amount });
      totalActiveIngredientWeight += amount;
    }
  });
  
  // Recalculate final nutrient profile based on actual recipe amounts (important due to rounding or greedy choices)
  const finalNutrientProfileKg: NutrientComposition = {};
   ALL_NUTRIENTS_ORDERED.forEach(n => { finalNutrientProfileKg[n] = 0; });

  recipe.forEach(item => {
    ALL_NUTRIENTS_ORDERED.forEach(nKey => {
      finalNutrientProfileKg[nKey] = (finalNutrientProfileKg[nKey] ?? 0) + item.amount * ((item.material.composition[nKey] ?? 0) / 100);
    });
  });

  const finalNutrientProfilePercent: NutrientComposition = {};
  if (totalMixWeightKg > EPSILON) {
    ALL_NUTRIENTS_ORDERED.forEach(n => {
      finalNutrientProfilePercent[n] = ((finalNutrientProfileKg[n] ?? 0) / totalMixWeightKg) * 100;
    });
  }

  // Final warnings for over/under supply
  ALL_NUTRIENTS_ORDERED.forEach(n => {
    const targetKg = targetNutrientsKg[n] ?? 0;
    const suppliedKg = finalNutrientProfileKg[n] ?? 0;
    const diffKg = suppliedKg - targetKg;
    const tolerance = Math.max(0.01 * targetKg, 0.001); // 1% of target or 1g

    if (targetKg > EPSILON) { // Only check if it was targeted
      if (diffKg < -tolerance) {
        warnings.push(`ปริมาณ ${n} ได้รับ ${suppliedKg.toFixed(3)} กก. ต่ำกว่าเป้าหมาย (${targetKg.toFixed(3)} กก.) ขาด ${Math.abs(diffKg).toFixed(3)} กก.`);
      } else if (diffKg > tolerance) {
        warnings.push(`ปริมาณ ${n} ได้รับ ${suppliedKg.toFixed(3)} กก. เกินเป้าหมาย (${targetKg.toFixed(3)} กก.) อยู่ ${diffKg.toFixed(3)} กก.`);
      }
    } else if (suppliedKg > tolerance) { // Nutrient not targeted but ended up in mix significantly
       warnings.push(`มี ${n} ในสูตรผสม ${suppliedKg.toFixed(3)} กก. โดยไม่ได้ตั้งเป้าหมาย`);
    }
  });
  
  const fillerNeededKg = totalMixWeightKg - totalActiveIngredientWeight;

  if (totalActiveIngredientWeight > totalMixWeightKg + EPSILON) {
    warnings.push(`น้ำหนักรวมของวัสดุ (${totalActiveIngredientWeight.toFixed(2)} กก.) เกินน้ำหนักสูตรที่ต้องการ (${totalMixWeightKg.toFixed(2)} กก.) อยู่ ${(totalActiveIngredientWeight - totalMixWeightKg).toFixed(2)} กก. อาจต้องปรับสูตร/วัสดุ`);
  } else if (fillerNeededKg > EPSILON && totalActiveIngredientWeight > EPSILON) {
     warnings.push(`อาจต้องใช้สารตัวเติม ${fillerNeededKg.toFixed(2)} กก. เพื่อให้ได้น้ำหนักรวม ${totalMixWeightKg.toFixed(2)} กก.`);
  }


  return {
    recipe,
    finalNutrientProfileKg,
    finalNutrientProfilePercent,
    totalActiveIngredientWeight,
    fillerNeededKg: Math.max(0, fillerNeededKg), // Filler cannot be negative
    warnings,
    errors,
  };
}
