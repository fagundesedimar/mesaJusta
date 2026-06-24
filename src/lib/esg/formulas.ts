const BASE_MULTIPLIER = 10
const MEALS_PER_KG = 2
const CO2_SAVED_PER_KG = 2.5

const CATEGORY_BONUS: Record<string, number> = {
  'Proteínas': 1.5,
  'Refeições Prontas': 1.5,
}

export function calcMoedasVerdes(weightKg: number, category: string): number {
  const bonus = CATEGORY_BONUS[category] ?? 1.0
  return weightKg * BASE_MULTIPLIER * bonus
}

export function calcMeals(weightKg: number): number {
  return weightKg * MEALS_PER_KG
}

export function calcCO2eq(weightKg: number): number {
  return weightKg * CO2_SAVED_PER_KG
}

export function calcTons(weightKg: number): number {
  return weightKg / 1000
}
