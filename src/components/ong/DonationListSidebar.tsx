'use client'

import { CATEGORIES } from '@/lib/schemas/donation.schema'

interface Donation {
  id: string
  name: string
  category: string
  weightKg: number
  distanceKm?: number
}

interface Props {
  donations: Donation[]
  selectedCategory: string
  selectedRadius: number | null
  onCategoryChange: (category: string) => void
  onRadiusChange: (radius: number | null) => void
  onReserve: (donationId: string) => void
}

const RADIUS_OPTIONS = [
  { label: 'Qualquer distância', value: null },
  { label: 'Até 5 km', value: 5 },
  { label: 'Até 15 km', value: 15 },
  { label: 'Até 30 km', value: 30 },
]

export default function DonationListSidebar({
  donations,
  selectedCategory,
  selectedRadius,
  onCategoryChange,
  onRadiusChange,
  onReserve,
}: Props) {
  return (
    <aside className="geo-sidebar">
      <div className="geo-sidebar__filters">
        <h3>Filtros</h3>

        <label className="geo-sidebar__label">Distância</label>
        <select
          className="geo-sidebar__select"
          value={selectedRadius ?? ''}
          onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) : null)}
          aria-label="Filtrar por distância"
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="geo-sidebar__label">Categoria</label>
        <select
          className="geo-sidebar__select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="geo-sidebar__list">
        <h3>Doações Próximas</h3>
        {donations.length === 0 ? (
          <p className="geo-sidebar__empty">Nenhuma doação encontrada.</p>
        ) : (
          donations.map((d) => (
            <div key={d.id} className="geo-sidebar__card">
              <div className="geo-sidebar__card-body">
                <strong>{d.name}</strong>
                <span className="geo-sidebar__card-meta">
                  {d.category} &middot; {d.weightKg} kg
                </span>
                {d.distanceKm != null && (
                  <span className="geo-sidebar__card-distance">
                    A {d.distanceKm.toFixed(1)} km de você
                  </span>
                )}
              </div>
              <button
                className="geo-sidebar__card-btn"
                onClick={() => onReserve(d.id)}
              >
                Reservar
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
