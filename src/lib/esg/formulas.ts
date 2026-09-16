import { calcGreenCoins } from '@/lib/gamification/formulas'

export { calcGreenCoins as calcMoedasVerdes }

const MEALS_PER_KG = 2
const CO2_SAVED_PER_KG = 2.5

export function calcMeals(weightKg: number): number {
  return weightKg * MEALS_PER_KG
}

export function calcCO2eq(weightKg: number): number {
  return weightKg * CO2_SAVED_PER_KG
}

export function calcTons(weightKg: number): number {
  return weightKg / 1000
}
