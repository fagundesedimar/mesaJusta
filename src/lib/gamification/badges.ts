export type BadgeLevel = 'BRONZE' | 'SILVER' | 'GOLD'

export function getESGBadge(greenCoins: number): BadgeLevel {
  if (greenCoins > 5000) return 'GOLD'
  if (greenCoins > 1000) return 'SILVER'
  return 'BRONZE'
}
