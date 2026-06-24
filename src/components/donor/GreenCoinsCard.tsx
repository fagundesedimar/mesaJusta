'use client'

import { getESGBadge, type BadgeLevel } from '@/lib/gamification/badges'

interface Props {
  greenCoins: number
}

const BADGE_LABELS: Record<BadgeLevel, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
}

export default function GreenCoinsCard({ greenCoins }: Props) {
  const badge = getESGBadge(greenCoins)

  return (
    <div className="gamification-card green-coins-card">
      <span className="green-coins-card__value">{greenCoins}</span>
      <span className="green-coins-card__label">Moedas Verdes</span>
      <span className={`green-coins-card__badge badge--${badge.toLowerCase()}`}>
        Selo {BADGE_LABELS[badge]}
      </span>
    </div>
  )
}
