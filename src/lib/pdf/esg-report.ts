import PDFDocument from 'pdfkit'

interface ESGReportMetrics {
  totalKgSaved: number
  totalTonsSaved: number
  totalMeals: number
  totalCO2eqKg: number
  totalDonations: number
  totalONGs: number
}

export function generateESGReport(
  metrics: ESGReportMetrics,
  period: { start?: string; end?: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(20).text('Mesa Justa — Relatório de Impacto ESG', { align: 'center' })
    doc.moveDown()

    if (period.start && period.end) {
      doc.fontSize(12).text(`Período analisado: ${period.start} a ${period.end}`, { align: 'center' })
    } else {
      doc.fontSize(12).text('Período analisado: Todos os registros', { align: 'center' })
    }
    doc.moveDown(2)

    const lineX = 50
    const col1 = 50
    const col2 = 200
    const col3 = 350

    doc.fontSize(14).text('Indicador', col1, undefined, { bold: true })
    doc.text('Valor', col3)
    doc.moveDown(0.5)

    doc.moveTo(lineX, doc.y).lineTo(550, doc.y).stroke()
    doc.moveDown()

    const items = [
      ['Total de Kg Salvos', metrics.totalKgSaved.toFixed(1)],
      ['Toneladas Métricas', metrics.totalTonsSaved.toFixed(3)],
      ['Refeições Complementadas', metrics.totalMeals.toFixed(0)],
      ['CO₂ Evitado (kg)', metrics.totalCO2eqKg.toFixed(1)],
      ['Doações Coletadas', metrics.totalDonations.toString()],
      ['ONGs Participantes', metrics.totalONGs.toString()],
    ]

    for (const [label, value] of items) {
      doc.fontSize(12).text(label, col1)
      doc.text(value, col3)
      doc.moveDown()
    }

    doc.moveDown(2)
    doc.fontSize(10).text('Gerado automaticamente pelo Mesa Justa — Circuito Solidário', { align: 'center', color: '#888' })

    doc.end()
  })
}
