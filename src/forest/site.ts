// Wspólne pola „Stanowiska” i zdjęć fitosocjologicznych dla siedlisk leśnych (transekt + 3 zdjęcia).
// Bazą są pola 7120 (te same nazwy kluczy -> ten sam eksport .docx, zapis .zip i kopia robocza).
import type { FieldDef } from '../7120/habitats/types'
import { isIsoDate } from '../7120/habitats/dates'
import { methodology7120 } from '../7120/habitats/7120/methodology'
import { pickField } from './helpers'

const MONTHS = ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']

export const coordHelp = (where: string, releveArea: number) =>
  `Współrzędne geograficzne ${where} osi transektu, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E. Jeśli punkt ma oznaczenie w bazie, dopisz je.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu za kilka lat. W tych samych trzech punktach (początek, środek, koniec) wykonuje się zdjęcia fitosocjologiczne (${releveArea} m²).`

export interface ForestSiteOptions {
  /** Kod siedliska do tekstów pomocy, np. „91I0”. */
  code: string
  /** Standardowe wymiary transektu, np. „200x20 m”. */
  transect: string
  /** Powierzchnia zdjęcia fitosocjologicznego w m² (do tekstów pomocy). */
  releveArea: number
  /** Okno optymalnego terminu: [miesiąc od, miesiąc do] albo funkcja ostrzeżenia dla daty ISO. */
  dateWindow?: [number, number] | ((iso: string) => string | null)
  /** Pola wstawiane zaraz po GUID (np. podtyp / wariant siedliska). */
  extra?: FieldDef[]
  /** Nadpisania pól po nazwie (hint, help, placeholder, defaultValue…). */
  overrides?: Record<string, Partial<FieldDef>>
}

export function forestSiteFields(o: ForestSiteOptions): FieldDef[] {
  const win = o.dateWindow
  const dateWarn =
    typeof win === 'function'
      ? (v: unknown) => (isIsoDate(v) ? win(v) : null)
      : win
        ? (v: unknown) => {
            if (!isIsoDate(v)) return null
            const m = Number(v.split('-')[1])
            return m >= win[0] && m <= win[1]
              ? null
              : `Termin poza optymalnym oknem (${MONTHS[win[0]]}–${MONTHS[win[1]]}). Pokrycie runa i spis gatunków mogą być niepełne.`
          }
        : undefined

  const fields: FieldDef[] = [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: obserwacje powtarza się co kilka lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend.`,
    },
    pickField(methodology7120.siteFields, 'guid'),
    ...(o.extra ?? []),
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi. Postać zdegradowaną zaznacz wprost.

Dlaczego: zespół wyznacza punkt odniesienia dla oceny – czego się spodziewać w drzewostanie i runie.`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 10,
      required: true,
      help: `Syntetyczny opis stanowiska w kilku zdaniach: położenie i granice płatu, podłoże, historia użytkowania, drzewostan (gatunki, wiek, zwarcie), podszyt, runo.

Dlaczego: opis pozwala kolejnemu obserwatorowi zrozumieć przyczyny zmian.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatu siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Powierzchnia płatu siedliska ${o.code} na stanowisku, w hektarach – nie powierzchnia transektu ani całego kompleksu leśnego. Najlepiej z GIS albo z kartowania granic płatu odbiornikiem GPS.

Dlaczego: zmiana powierzchni płatu między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
    },
    pickField(methodology7120.siteFields, 'protectedAreas'),
    { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku', o.releveArea) },
    { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka', o.releveArea) },
    { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca', o.releveArea) },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: o.transect,
      required: true,
      hint: `Standard to ${o.transect.replace('x', '×')}.`,
      help: `Faktyczne wymiary transektu. Standard dla ${o.code} to ${o.transect.replace('x', '×')}. Gdy taki transekt nie mieści się w płacie, dopasuj go do terenu i wpisz faktyczne wymiary.

Dlaczego: pokrycia (%) liczy się względem powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 150',
      required: true,
      help: 'Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres.',
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 14.07.2025',
      required: true,
      hint: Array.isArray(win) ? `Optymalnie od ${MONTHS[win[0]]} do ${MONTHS[win[1]]}.` : undefined,
      help: 'Dzień obserwacji w terenie.',
      warn: dateWarn,
    },
    pickField(methodology7120.siteFields, 'observer'),
  ]
  const over = o.overrides ?? {}
  return fields.map((f) => (over[f.name] ? ({ ...f, ...over[f.name] } as FieldDef) : f))
}

/**
 * Pola zdjęcia fitosocjologicznego (jak w 7120) z domyślną powierzchnią `area` m² i nadpisaniami po nazwie pola.
 * `helps` podmienia tylko tekst pomocy (najczęstszy przypadek).
 */
export function forestReleveFields(o: { area: number; helps?: Record<string, string>; overrides?: Record<string, Partial<FieldDef>> }): FieldDef[] {
  return methodology7120.releves.fields.map((f): FieldDef => {
    let out: FieldDef = f
    if (f.name === 'area')
      out = {
        ...out,
        defaultValue: o.area,
        help: `Powierzchnia zdjęcia w m². Standard to ${o.area} m². Zmieniaj tylko wtedy, gdy płat jest za mały, i wpisz faktyczną wartość.\n\nDlaczego: liczba gatunków rośnie z powierzchnią – zdjęcia o różnej wielkości nie są porównywalne.`,
      } as FieldDef
    if (o.helps?.[f.name]) out = { ...out, help: o.helps[f.name] } as FieldDef
    if (o.overrides?.[f.name]) out = { ...out, ...o.overrides[f.name] } as FieldDef
    return out
  })
}
