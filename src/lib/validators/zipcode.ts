const SP_PREFIXES = ['01', '02', '03', '04', '05', '06', '07', '08', '09']
const MG_PREFIXES = ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39']

export async function validateZipCodeState(cep: string): Promise<'SP' | 'MG' | null> {
  const cleanCEP = cep.replace(/\D/g, '')

  if (cleanCEP.length !== 8) return null

  const prefix = cleanCEP.substring(0, 2)

  if (SP_PREFIXES.includes(prefix)) return 'SP'
  if (MG_PREFIXES.includes(prefix)) return 'MG'

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    if (!response.ok) return null
    const data = await response.json()
    if (data.erro) return null
    const uf = data.uf as string
    if (uf === 'SP') return 'SP'
    if (uf === 'MG') return 'MG'
    return null
  } catch {
    return null
  }
}
