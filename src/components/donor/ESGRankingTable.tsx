'use client'

import { getESGBadge, type BadgeLevel } from '@/lib/gamification/badges'

interface RankingEntry {
  rank: number
  establishmentName: string
  greenCoins: number
  badge: BadgeLevel
}

interface Props {
  data: RankingEntry[]
  currentDonorName?: string
}

const BADGE_LABELS: Record<BadgeLevel, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
}

export default function ESGRankingTable({ data, currentDonorName }: Props) {
  if (data.length === 0) {
    return (
      <div className="gamification-card ranking-table">
        <h3 className="ranking-table__title">Ranking ESG — Top 10 do Mês</h3>
        <p className="ranking-table__empty">Nenhuma doação coletada neste mês.</p>
      </div>
    )
  }

  return (
    <div className="gamification-card ranking-table">
      <h3 className="ranking-table__title">Ranking ESG — Top 10 do Mês</h3>
      <table className="ranking-table__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Estabelecimento</th>
            <th>Moedas Verdes</th>
            <th>Selo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr
              key={entry.rank}
              className={
                entry.establishmentName === currentDonorName
                  ? 'ranking-table__row--highlight'
                  : ''
              }
            >
              <td>{entry.rank}º</td>
              <td>{entry.establishmentName}</td>
              <td>{entry.greenCoins}</td>
              <td>
                <span
                  className={`badge--${entry.badge.toLowerCase()}`}
                >
                  {BADGE_LABELS[entry.badge]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
