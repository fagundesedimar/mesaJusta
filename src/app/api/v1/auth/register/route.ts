import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RegisterSchema } from '@/lib/schemas/auth.schema'
import { validateCPF, validateCNPJ } from '@/lib/validators/document'
import { validateZipCodeState } from '@/lib/validators/zipcode'
import { hashPassword } from '@/lib/auth/password'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, email, password, role, document, zipCode } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado.' },
        { status: 409 }
      )
    }

    if (role === 'DONOR' && !validateCPF(document)) {
      return NextResponse.json(
        { error: 'CPF inválido. Deve conter 11 dígitos numéricos.' },
        { status: 422 }
      )
    }

    if (role === 'ONG' && !validateCNPJ(document)) {
      return NextResponse.json(
        { error: 'CNPJ inválido. Deve conter 14 dígitos numéricos.' },
        { status: 422 }
      )
    }

    const state = await validateZipCodeState(zipCode)
    if (!state) {
      return NextResponse.json(
        { error: 'Cadastro restrito aos estados de SP e MG.' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: {
          create: {
            name,
            document,
            zipCode,
            state,
            profileType: role === 'ONG' ? 'ONG' : 'DONOR',
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
