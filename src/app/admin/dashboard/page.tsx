export const dynamic = 'force-dynamic'

import KPICard from '@/components/admin/KPICard'
import AuditLogTable from '@/components/admin/AuditLogTable'
import { prisma } from '@/lib/prisma'
import { calcMeals, calcCO2eq, calcTons } from '@/lib/esg/formulas'
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
    const aggregation = await prisma.donation.aggregate({
      _sum: { weightKg: true },
      _count: true,
      where: { status: 'COLLECTED' },
    })

    const totalKgSaved = Number(aggregation._sum.weightKg ?? 0)

    const ongCount = await prisma.donation.groupBy({
      by: ['ongId'],
      where: { status: 'COLLECTED', ongId: { not: null } },
    })

    return {
      totalKgSaved,
      totalTonsSaved: calcTons(totalKgSaved),
      totalMeals: calcMeals(totalKgSaved),
      totalCO2eqKg: calcCO2eq(totalKgSaved),
      totalDonations: aggregation._count,
      totalONGs: ongCount.length,
    }
  } catch {
    return {
      totalKgSaved: 0,
      totalTonsSaved: 0,
      totalMeals: 0,
      totalCO2eqKg: 0,
      totalDonations: 0,
      totalONGs: 0,
    }
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics()

  return (
    <div className="dashboard-admin">
      <h1>Dashboard Administrativo</h1>

      <div className="kpi-cards">
        <KPICard icon="" value={`${metrics.totalKgSaved.toFixed(1)} kg`} label="Kg Salvos" />
        <KPICard icon="" value={`${metrics.totalMeals.toFixed(0)}`} label="Famílias Atendidas" />
        <KPICard icon="" value={`${metrics.totalCO2eqKg.toFixed(1)} kg`} label="CO₂ Evitado" />
        <KPICard icon="" value={`${metrics.totalDonations}`} label="Doações Coletadas" />
      </div>

      <AuditLogTable />
    </div>
  )
}
