interface KPICardProps {
  icon: string
  value: string
  label: string
}

export default function KPICard({ icon, value, label }: KPICardProps) {
  return (
    <div className="kpi-card">
      {icon && <span className="kpi-card__icon">{icon}</span>}
      <span className="kpi-card__value">{value}</span>
      <span className="kpi-card__label">{label}</span>
    </div>
  )
}
