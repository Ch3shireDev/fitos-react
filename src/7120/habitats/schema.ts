// Schemat zod generowany z definicji metodyki. Jedna metodyka = jeden schemat, zero ręcznego klepania.
import { z } from 'zod'
import { BRAUN_BLANQUET, GRADES, LAYERS, allOtherFields, type FieldDef, type Methodology } from './types'
import { isIsoDate } from './dates'

const REQUIRED = 'To pole jest wymagane'

function numberSchema(f: Extract<FieldDef, { kind: 'number' }>) {
  let s = z.number({ error: 'Wpisz liczbę (przecinek też działa)' })
  if (f.min !== undefined) s = s.min(f.min, `Wartość nie może być mniejsza niż ${f.min}`)
  if (f.max !== undefined) s = s.max(f.max, `Wartość nie może być większa niż ${f.max}`)
  return f.required ? s : s.optional()
}

const speciesRowSchema = z.object({
  name: z.string().trim().min(1, 'Podaj nazwę gatunku albo usuń wiersz'),
  cover: z
    .number({ error: 'Pokrycie w %: liczba (np. 40 albo 0,5) albo <1' })
    .min(0, 'Pokrycie nie może być ujemne')
    .max(100, 'Pokrycie powyżej 100%? Ambitnie.')
    .optional(),
})

const releveSpeciesRowSchema = z.object({
  layer: z.enum(LAYERS, { error: 'Wybierz warstwę' }),
  name: z.string().trim().min(1, 'Podaj nazwę gatunku albo usuń wiersz'),
  abundance: z.enum(BRAUN_BLANQUET, { error: 'Wybierz ilościowość (r, +, 1–5)' }),
})

const photoRowSchema = z.object({
  name: z.string().optional(),
  dataUrl: z.string().optional(),
  caption: z.string().trim().min(1, 'Dodaj podpis zdjęcia (np. „Fot. 1. Widok ogólny…”)'),
})

export function fieldSchema(f: FieldDef): z.ZodType {
  switch (f.kind) {
    case 'photos':
      return f.required ? z.array(photoRowSchema).min(1, 'Dodaj przynajmniej jedno zdjęcie') : z.array(photoRowSchema)
    case 'number':
      return numberSchema(f)
    case 'species':
      return f.required
        ? z.array(speciesRowSchema).min(1, 'Dodaj przynajmniej jeden gatunek')
        : z.array(speciesRowSchema)
    case 'releve-species':
      return z.array(releveSpeciesRowSchema)
    case 'table':
      return f.required ? z.array(fieldsSchema(f.columns)).min(1, 'Dodaj przynajmniej jeden wiersz') : z.array(fieldsSchema(f.columns))
    case 'date': {
      const msg = 'Podaj datę w formacie DD.MM.RRRR, np. 14.07.2025'
      return f.required
        ? z.string().min(1, REQUIRED).refine(isIsoDate, msg)
        : z.string().optional().refine((v) => !v || isIsoDate(v), msg)
    }
    case 'select':
      return f.required
        ? z.string().min(1, 'Wybierz jedną z opcji')
        : z.string().optional()
    default:
      return f.required ? z.string().trim().min(1, REQUIRED) : z.string().optional()
  }
}

export function fieldsSchema(fields: FieldDef[]) {
  return z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f)])))
}

export const gradeSchema = z.enum(GRADES, { error: 'Wybierz ocenę (FV, U1, U2 albo XX)' })

const impactSchema = z.object({
  code: z.string().trim().min(1, 'Podaj kod oddziaływania'),
  name: z.string().trim().min(1, 'Podaj nazwę'),
  influence: z.enum(['-', '0', '+'], { error: 'Wybierz wpływ' }),
  intensity: z.enum(['H', 'M', 'L'], { error: 'Wybierz intensywność' }),
  description: z.string().optional(),
})

const threatSchema = z.object({
  code: z.string().trim().min(1, 'Podaj kod zagrożenia'),
  name: z.string().trim().min(1, 'Podaj nazwę'),
  description: z.string().optional(),
})

export function buildCardSchema(m: Methodology) {
  return z.object({
    site: fieldsSchema(m.siteFields),
    releves: z.array(fieldsSchema(m.releves.fields)),
    indicators: z.object(
      Object.fromEntries(
        m.indicators.map((i) => [
          i.id,
          z.object({
            inputs: fieldsSchema(i.inputs),
            value: z.string().trim().min(1, 'Wpisz wartość lub opis wskaźnika'),
            grade: gradeSchema,
          }),
        ]),
      ),
    ),
    prospects: z.object({
      value: z.string().trim().min(1, 'Opisz perspektywy ochrony'),
      grade: gradeSchema,
    }),
    impacts: z.array(impactSchema),
    threats: z.array(threatSchema),
    other: fieldsSchema(allOtherFields(m)),
    overallComment: z.string().optional(),
  })
}
