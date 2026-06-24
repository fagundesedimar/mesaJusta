const BASE_MULTIPLIER = 10

const CATEGORY_BONUS: Record<string, number> = {
  'Proteínas': 1.5,
  'Refeições Prontas': 1.5,
}

export function calcMoedasVerdes(weightKg: number, category: string): number {
  const bonus = CATEGORY_BONUS[category] ?? 1.0
  return weightKg * BASE_MULTIPLIER * bonus
}
