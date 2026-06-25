'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { validateCPF, validateCNPJ } from '@/lib/validators/document'
import '@/components/auth/AuthForm.css'

const SP_MG_PREFIXES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39']

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'DONOR' | 'ONG' | ''>('')
  const [document, setDocument] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [docError, setDocError] = useState('')
  const [geoError, setGeoError] = useState('')

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setStep(1)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao fazer login.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleDocumentChange(value: string) {
    const cleaned = value.replace(/\D/g, '')
    setDocument(cleaned)
    setDocError('')

    if (role === 'DONOR' && cleaned.length === 11 && !validateCPF(cleaned)) {
      setDocError('CPF inválido.')
    }
    if (role === 'ONG' && cleaned.length === 14 && !validateCNPJ(cleaned)) {
      setDocError('CNPJ inválido.')
    }
  }

  function handleZipCodeChange(value: string) {
    const cleaned = value.replace(/\D/g, '')
    setZipCode(cleaned)
    setGeoError('')

    if (cleaned.length === 8) {
      const prefix = cleaned.substring(0, 2)
      if (!SP_MG_PREFIXES.includes(prefix)) {
        setGeoError('Cadastro restrito aos estados de SP e MG.')
      }
    }
  }

  function canGoToStep2() {
    return name && email && password && role
  }

  function canGoToStep3() {
    const docValid = role === 'DONOR'
      ? document.length === 11
      : document.length === 14
    return docValid && !docError
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (geoError) return

    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          document,
          zipCode,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(typeof data.error === 'string' ? data.error : 'Erro ao cadastrar.')
        return
      }

      setMode('login')
      setEmail(email)
      setPassword('')
      setError('Conta criada com sucesso! Faça login.')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
        {mode === 'login' ? (
          <>
            <h1 className="auth-form__title">Entrar</h1>
            <p className="auth-form__subtitle">Acesse sua conta no Mesa Justa</p>

            {error && <div className="auth-form__error">{error}</div>}

            <div className="auth-form__field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '0.75rem' }}>
              <a href="/login" className="auth-form__forgot">
                Esqueci minha senha
              </a>
            </div>

            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="auth-form__link">
              Ainda não tem conta?{' '}
              <button type="button" className="auth-form__link-btn" onClick={toggleMode}>
                Criar Conta
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="auth-form__title">Criar Conta</h1>
            <p className="auth-form__subtitle">Cadastre-se no Mesa Justa</p>

            <div className="auth-form__steps">
              <span className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>Dados</span>
              <span className={step === 2 ? 'active' : ''} onClick={() => setStep(2)}>Documento</span>
              <span className={step === 3 ? 'active' : ''} onClick={() => setStep(3)}>Localização</span>
            </div>

            {error && <div className="auth-form__error">{error}</div>}

            {step === 1 && (
              <>
                <div className="auth-form__field">
                  <label htmlFor="name">Nome</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="reg-email">E-mail</label>
                  <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="reg-password">Senha</label>
                  <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="role">Tipo de conta</label>
                  <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'DONOR' | 'ONG')} required>
                    <option value="">Selecione...</option>
                    <option value="DONOR">Doador</option>
                    <option value="ONG">ONG</option>
                  </select>
                </div>

                <button type="button" className="auth-form__submit" onClick={() => canGoToStep2() && setStep(2)} disabled={!canGoToStep2()}>
                  Próximo
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="auth-form__field">
                  <label htmlFor="document">
                    {role === 'DONOR' ? 'CPF' : role === 'ONG' ? 'CNPJ' : 'Documento'}
                  </label>
                  <input
                    id="document"
                    value={document}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    placeholder={role === 'DONOR' ? '11 dígitos' : '14 dígitos'}
                    required
                  />
                  {docError && <span className="auth-form__field-error">{docError}</span>}
                </div>

                <button type="button" className="auth-form__submit" onClick={() => setStep(1)}>Voltar</button>
                <button type="button" className="auth-form__submit" onClick={() => canGoToStep3() && setStep(3)} disabled={!canGoToStep3()}>
                  Próximo
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="auth-form__field">
                  <label htmlFor="zipCode">CEP</label>
                  <input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => handleZipCodeChange(e.target.value)}
                    placeholder="8 dígitos"
                    maxLength={8}
                    required
                  />
                  {geoError && <span className="auth-form__field-error">{geoError}</span>}
                </div>

                <button type="button" className="auth-form__submit" onClick={() => setStep(2)}>Voltar</button>
                <button type="submit" className="auth-form__submit" disabled={loading || !!geoError}>
                  {loading ? 'Cadastrando...' : 'Confirmar Cadastro'}
                </button>
              </>
            )}

            <p className="auth-form__link">
              Já tem conta?{' '}
              <button type="button" className="auth-form__link-btn" onClick={toggleMode}>
                Entrar
              </button>
            </p>
          </>
        )}
      </form>
    </div>
  )
}
