import KPICard from '@/components/admin/KPICard'
import AuditLogTable from '@/components/admin/AuditLogTable'
import '@/components/admin/AdminDashboard.css'

interface DashboardMetrics {
  totalKgSaved: number
  totalTonsSaved: number
  totalMeals: number
  totalCO2eqKg: number
  totalDonations: number
  totalONGs: number
}

async function getMetrics(): Promise<DashboardMetrics> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/admin/dashboard`, {
      headers: token ? { Cookie: `auth_token=${token}` } : {},
      cache: 'no-store',
    })

    if (res.ok) return res.json()
  } catch {
    // fallback to zeros
  }

  return {
    totalKgSaved: 0,
    totalTonsSaved: 0,
    totalMeals: 0,
    totalCO2eqKg: 0,
    totalDonations: 0,
    totalONGs: 0,
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics()

  return (
    <div className="dashboard-admin">
      <h1>Dashboard Administrativo</h1>

      <div className="kpi-cards">
        <KPICard icon="⚖️" value={`${metrics.totalKgSaved.toFixed(1)} kg`} label="Kg Salvos" />
        <KPICard icon="🍽️" value={`${metrics.totalMeals.toFixed(0)}`} label="Refeições" />
        <KPICard icon="🌱" value={`${metrics.totalCO2eqKg.toFixed(1)} kg`} label="CO₂ Evitado" />
        <KPICard icon="📦" value={`${metrics.totalDonations}`} label="Doações Coletadas" />
      </div>

      <AuditLogTable />
    </div>
  )
}
