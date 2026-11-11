import { createContext, useContext } from 'react'
import type { Methodology } from '../../habitats/types'

export const MethodologyContext = createContext<Methodology | null>(null)

export function useMethodology(): Methodology {
  const m = useContext(MethodologyContext)
  if (!m) throw new Error('useMethodology poza <HabitatCardForm>. Gratulacje.')
  return m
}
