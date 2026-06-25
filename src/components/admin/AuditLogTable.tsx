'use client'

import { useState, useEffect, useCallback } from 'react'

interface AuditLog {
  id: string
  donationId: string
  ongId: string
  donorId: string
  executorId: string
  timestamp: string
}

export default function AuditLogTable() {
  const [data, setData] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/v1/admin/audit-logs?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data)
        setTotal(json.total)
        setTotalPages(json.totalPages)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    window.open(`/api/v1/admin/report/esg?${params}`, '_blank')
  }

  return (
    <div className="audit-log-section">
      <h2>Logs de Auditoria</h2>

      <div className="filters">
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          placeholder="Data início"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          placeholder="Data fim"
        />
        <button className="btn-export" onClick={handleExport}>
          Exportar Relatório ESG
        </button>
      </div>

      {loading ? (
        <p role="status" aria-live="polite">Carregando...</p>
      ) : (
        <>
          <table className="audit-log-table" aria-label="Logs de auditoria">
            <thead>
              <tr>
                <th>Doação</th>
                <th>Doador</th>
                <th>ONG</th>
                <th>Executor</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr key={log.id}>
                  <td>{log.donationId.slice(0, 8)}...</td>
                  <td>{log.donorId.slice(0, 8)}...</td>
                  <td>{log.ongId.slice(0, 8)}...</td>
                  <td>{log.executorId.slice(0, 8)}...</td>
                  <td>{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span>{total} registro(s) — Página {page} de {totalPages}</span>
            <div className="pagination-buttons">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Página anterior">
                Anterior
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Próxima página">
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
