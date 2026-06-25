import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  )
}
