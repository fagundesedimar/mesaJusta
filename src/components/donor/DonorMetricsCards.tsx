interface Props {
  donations: {
    status: string
    weightKg: number
    moedasVerdes: number | null
  }[]
}

export default function DonorMetricsCards({ donations }: Props) {
  const kgDoados = donations
    .filter((d) => d.status === 'COLLECTED')
    .reduce((sum, d) => sum + Number(d.weightKg), 0)

  const moedasVerdes = donations
    .reduce((sum, d) => sum + Number(d.moedasVerdes ?? 0), 0)

  const ativas = donations
    .filter((d) => d.status === 'AVAILABLE' || d.status === 'RESERVED')
    .length

  return (
    <div className="metrics-cards">
      <div className="metrics-card">
        <span className="metrics-card__value">{kgDoados.toFixed(1)}</span>
        <span className="metrics-card__label">Kg Doados</span>
      </div>
      <div className="metrics-card">
        <span className="metrics-card__value">{moedasVerdes.toFixed(0)}</span>
        <span className="metrics-card__label">Moedas Verdes</span>
      </div>
      <div className="metrics-card">
        <span className="metrics-card__value">{ativas}</span>
        <span className="metrics-card__label">Doações Ativas</span>
      </div>
    </div>
  )
}
