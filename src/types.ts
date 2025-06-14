export enum Nutrient {
  N = "N",
  P2O5 = "P₂O₅",
  K2O = "K₂O",
  Ca = "Ca",
  Mg = "Mg",
  S = "S",
  B = "B",
  Zn = "Zn",
}

export type NutrientComposition = {
  [key in Nutrient]?: number; // Percentage value (0-100)
};

export interface MaterialInfo {
  id: string;
  name: string;
  nameTh: string;
  chemicalFormula?: string; // e.g., (NH₂)₂CO for Urea
  npkDisplay?: string; // e.g., 46-0-0
  composition: NutrientComposition;
  isMotherFertilizer: boolean; // Differentiates primary NPK sources
  description?: string;
}

export interface CalculatedAmount {
  material: MaterialInfo;
  amount: number; // in kg
}

export interface CalculationResult {
  recipe: CalculatedAmount[];
  finalNutrientProfileKg: NutrientComposition;
  finalNutrientProfilePercent: NutrientComposition;
  totalActiveIngredientWeight: number;
  fillerNeededKg: number;
  warnings: string[];
  errors: string[];
}

export const ALL_NUTRIENTS_ORDERED: Nutrient[] = [
  Nutrient.N, Nutrient.P2O5, Nutrient.K2O,
  Nutrient.Ca, Nutrient.Mg, Nutrient.S,
  Nutrient.B, Nutrient.Zn
];

export const NUTRIENT_PRIORITIES_FOR_CALCULATION: Nutrient[] = [
  Nutrient.P2O5, Nutrient.K2O, // Prioritize P & K
  Nutrient.N,                 // Then N
  Nutrient.Mg, Nutrient.Ca, Nutrient.S, // Then secondary
  Nutrient.B, Nutrient.Zn     // Then micro
];

export const NUTRIENT_DISPLAY_CATEGORIES: Record<string, Nutrient[]> = {
  primary: [Nutrient.N, Nutrient.P2O5, Nutrient.K2O],
  other: [Nutrient.Ca, Nutrient.Mg, Nutrient.S, Nutrient.B, Nutrient.Zn],
};
