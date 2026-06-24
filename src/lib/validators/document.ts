export function validateCPF(doc: string): boolean {
  if (doc.length !== 11) return false
  if (!/^\d+$/.test(doc)) return false
  return true
}

export function validateCNPJ(doc: string): boolean {
  if (doc.length !== 14) return false
  if (!/^\d+$/.test(doc)) return false
  return true
}
