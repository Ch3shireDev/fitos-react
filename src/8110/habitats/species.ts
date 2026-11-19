// Słownik gatunków dla 8110 (piargi i gołoborza krzemianowe), zebrany z przewodnika GIOŚ (Stawowczyk, Kozłowska-Kozak,
// Kozak 2015, pkt 1 i 4 „Typowe gatunki roślin”, tab. 1), z przykładowej karty (Dolina Pańszczyca 4, 2013 – 19 gatunków
// typowych, 43 wysokogórskie, trzy zdjęcia) i ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2024 (gatunki typowe
// i wysokogórskie wymieniane przez ekspertów, drzewa i krzewy na piargach).
// Dwie niezależne cechy: `typical` – gatunek typowy (charakterystyczny i wyróżniający rzędu Androsacetalia alpinae albo
// reprezentatywny dla podtypu wg Mróz & Perzanowska 2004), `alpine` – gatunek wysokogórski (centrum rozmieszczenia
// pionowego w piętrze subalpejskim, alpejskim albo turniowym). Ten sam gatunek bywa jednym, drugim albo obydwoma.
// Drzewa i krzewy – warstwa B, runo – C, mchy, wątrobowce i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type Subtype8110 = '8110-1' | '8110-2' | '8110-3' | '8110-4'

export interface SpeciesEntry8110 {
  latin: string
  polish: string
  /**
   * Gatunek typowy. 'guide' – wymieniony w pkt 4 przewodnika albo w karcie przykładowej; 'report' – wymieniany jako
   * typowy w sprawozdaniach 2016–2018 i 2024. undefined – nie jest typowy.
   */
  typical?: 'guide' | 'report'
  /** Podtypy, dla których przewodnik (pkt 4) albo karta przykładowa podają gatunek jako typowy. */
  subtypes?: Subtype8110[]
  /**
   * Gatunek wysokogórski. 'guide' – na liście 43 gatunków karty przykładowej albo nazwany wysokogórskim w pkt 4;
   * 'report' – liczony jako wysokogórski w sprawozdaniu 2024 (Sudety). false – znany gatunek, którego karta przykładowa
   * nie liczy jako wysokogórskiego (centrum rozmieszczenia niżej: regiel, piętro kosodrzewiny).
   */
  alpine: 'guide' | 'report' | false
  woody?: boolean
  /** Mech, wątrobowiec albo porost – warstwa D. */
  cryptogam?: boolean
  /** Gatunek obcy geograficznie (wskaźnik „Obce gatunki inwazyjne”). */
  alien?: boolean
  /** Wpis dla całego rodzaju („Racomitrium spp.”) – łapie też gatunki rodzaju spoza katalogu. */
  genus?: boolean
}

type Extra = Partial<Omit<SpeciesEntry8110, 'latin' | 'polish'>>
const e = (latin: string, polish: string, extra: Extra): SpeciesEntry8110 => ({ latin, polish, alpine: false, ...extra })

const S1: Extra = { typical: 'guide', subtypes: ['8110-1'] }
const S2: Extra = { typical: 'guide', subtypes: ['8110-2'] }
/** Gatunek typowy i wysokogórski wg karty przykładowej. */
const ta = (latin: string, polish: string, extra: Extra) => e(latin, polish, { alpine: 'guide', ...extra })
/** Gatunek wysokogórski (nie typowy) z listy karty przykładowej. */
const a = (latin: string, polish: string, extra: Extra = {}) => e(latin, polish, { alpine: 'guide', ...extra })
const D: Extra = { cryptogam: true }
const W: Extra = { woody: true }

export const SPECIES_8110: SpeciesEntry8110[] = [
  // ---- typowe dla 8110-1 (pkt 4 przewodnika + karta przykładowa), wszystkie wysokogórskie ----
  ta('Cardaminopsis neglecta', 'rzeżusznik tatrzański', S1),
  ta('Arabidopsis neglecta', 'rzeżusznik tatrzański (syn.)', S1),
  ta('Cerastium uniflorum', 'rogownica jednokwiatowa', S1),
  ta('Geum reptans', 'kuklik rozesłany', S1),
  ta('Leucanthemopsis alpina', 'złocieniec alpejski', S1),
  ta('Oxyria digyna', 'szczawiór alpejski', S1),
  ta('Poa laxa', 'wiechlina wiotka', { typical: 'guide', subtypes: ['8110-1', '8110-4'] }),
  ta('Ranunculus glacialis', 'jaskier lodnikowy', S1),
  ta('Saxifraga bryoides', 'skalnica mchowata', S1),
  ta('Saxifraga carpatica', 'skalnica karpacka', S1),
  ta('Saxifraga carpathica', 'skalnica karpacka (syn.)', S1),
  ta('Saxifraga oppositifolia', 'skalnica naprzeciwlistna', S1),
  ta('Saxifraga wahlenbergii', 'skalnica tatrzańska', S1),
  ta('Saxifraga wahlenbergi', 'skalnica tatrzańska (syn.)', S1),

  // ---- typowe dla 8110-2 ----
  ta('Agrostis rupestris', 'mietlica skalna', S2),
  e('Deschampsia flexuosa', 'śmiałek pogięty', { typical: 'guide', subtypes: ['8110-2', '8110-3', '8110-4'] }),
  e('Avenella flexuosa', 'śmiałek pogięty (syn.)', { typical: 'guide', subtypes: ['8110-2', '8110-3', '8110-4'] }),
  ta('Doronicum clusii', 'omieg kozłowiec', S2),
  ta('Festuca picta', 'kostrzewa barwna', S2),
  e('Homogyne alpina', 'podbiałek alpejski', S2),
  e('Huperzia selago', 'wroniec widlasty', { typical: 'guide', subtypes: ['8110-2', '8110-3', '8110-4'] }),
  ta('Luzula alpino-pilosa', 'kosmatka brunatna', { typical: 'guide', subtypes: ['8110-2', '8110-4'] }),
  ta('Luzula alpinopilosa', 'kosmatka brunatna (syn.)', { typical: 'guide', subtypes: ['8110-2', '8110-4'] }),
  ta('Mutellina purpurea', 'marchwica pospolita', S2),
  ta('Ligusticum mutellina', 'marchwica pospolita (syn.)', S2),
  ta('Poa granitica', 'wiechlina granitowa', S2),
  ta('Ranunculus pseudomontanus', 'jaskier halny', S2),
  e('Soldanella carpatica', 'urdzik karpacki', S2),
  ta('Salix retusa', 'wierzba wykrojona', S2),
  ta('Veronica alpina', 'przetacznik alpejski', S2),

  // ---- typowe dla 8110-3 i 8110-4 (Sudety, Babia Góra) ----
  e('Cryptogramma crispa', 'zmienka górska', { typical: 'guide', subtypes: ['8110-3'], alpine: 'report' }),
  ta('Festuca airoides', 'kostrzewa niska', { typical: 'guide', subtypes: ['8110-3', '8110-4'] }),
  ta('Festuca supina', 'kostrzewa niska (syn.)', { typical: 'guide', subtypes: ['8110-3', '8110-4'] }),
  ta('Rhodiola rosea', 'różeniec górski', { typical: 'guide', subtypes: ['8110-4'] }),
  e('Andreaea rupestris', 'naleźlina skalna', { typical: 'guide', subtypes: ['8110-3'], alpine: 'report', ...D }),
  e('Racomitrium spp.', 'skalniczki', { typical: 'guide', subtypes: ['8110-3'], alpine: 'report', genus: true, ...D }),
  e('Racomitrium sudeticum', 'skalniczek sudecki', { typical: 'guide', subtypes: ['8110-3'], alpine: 'report', ...D }),
  e('Lecanora spp.', 'misecznice', { typical: 'guide', subtypes: ['8110-3'], genus: true, ...D }),
  e('Rhizocarpon spp.', 'wzorce', { typical: 'guide', subtypes: ['8110-3'], genus: true, ...D }),
  e('Rhizocarpon geographicum', 'wzorzec geograficzny', { typical: 'guide', subtypes: ['8110-3', '8110-4'], ...D }),
  e('Umbilicaria spp.', 'kruszownice', { typical: 'guide', subtypes: ['8110-3'], genus: true, ...D }),
  e('Umbilicaria cylindrica', 'kruszownica zwyczajna', { typical: 'guide', subtypes: ['8110-3', '8110-4'], alpine: 'report', ...D }),

  // ---- typowe wg sprawozdań (2018, 2024) ----
  ta('Arabis alpina', 'gęsiówka alpejska', { typical: 'report' }),
  ta('Gentiana punctata', 'goryczka kropkowana', { typical: 'report' }),
  ta('Oreochloa disticha', 'boimka dwurzędowa', { typical: 'report' }),
  ta('Pedicularis oederi', 'gnidosz dwubarwny', { typical: 'report' }),
  ta('Pedicularis oederii', 'gnidosz dwubarwny (syn.)', { typical: 'report' }),
  ta('Pedicularis verticillata', 'gnidosz okółkowy', { typical: 'report' }),
  ta('Sedum alpestre', 'rozchodnik alpejski', { typical: 'report' }),
  ta('Silene acaulis', 'lepnica bezłodygowa', { typical: 'report' }),
  e('Vaccinium gaultherioides', 'borówka halna', { typical: 'report', alpine: 'guide' }),
  e('Vaccinium uliginosum subsp. microphyllum', 'borówka halna (syn.)', { typical: 'report', alpine: 'guide' }),

  // ---- wysokogórskie z karty przykładowej (43 gatunki), nie typowe ----
  a('Anthoxanthum alpinum', 'tomka alpejska'),
  a('Campanula alpina', 'dzwonek alpejski'),
  a('Campanula polymorpha', 'dzwonek wąskolistny'),
  a('Cerastium eriophorum', 'rogownica watowata'),
  a('Galium anisophyllon', 'przytulia nierównolistna'),
  a('Geum montanum', 'kuklik górski'),
  a('Hieracium alpinum', 'jastrzębiec alpejski'),
  a('Juncus trifidus', 'sit skucina'),
  a('Leontodon pseudotaraxaci', 'brodawnik tatrzański'),
  a('Luzula spicata', 'kosmatka kłosowa'),
  a('Minuartia sedoides', 'mokrzyca rozchodnikowata'),
  a('Poa alpina', 'wiechlina alpejska'),
  a('Polygonum viviparum', 'rdest żyworodny'),
  a('Bistorta vivipara', 'rdest żyworodny (syn.)'),
  a('Primula minima', 'pierwiosnek maleńki'),
  a('Sagina saginoides', 'karmnik skalny'),
  a('Salix herbacea', 'wierzba zielna'),
  a('Saxifraga aizoides', 'skalnica nakrapiana'),
  a('Thymus alpestris', 'macierzanka halna'),

  // ---- wysokogórskie wg sprawozdania 2024 (Karkonosze, Śnieżnik) ----
  e('Athyrium distentifolium', 'wietlica alpejska', { alpine: 'report' }),
  e('Empetrum hermaphroditum', 'bażyna obupłciowa', { alpine: 'report' }),
  e('Polytrichastrum alpinum', 'płonnik alpejski', { alpine: 'report', ...D }),
  e('Kiaeria blyttii', 'kieria Blytta', { alpine: 'report', ...D }),

  // ---- pozostałe gatunki z karty przykładowej i sprawozdań (ani typowe, ani wysokogórskie) ----
  e('Saxifraga paniculata', 'skalnica gronkowa', {}),
  e('Taraxacum sp.', 'mniszek', {}),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', {}),
  e('Adenostyles alliariae', 'miłosna górska', {}),
  e('Vaccinium myrtillus', 'borówka czarna', {}),
  e('Vaccinium vitis-idaea', 'borówka brusznica', {}),
  e('musci indet.', 'mchy nieoznaczone', D),
  e('Cladonia sp.', 'chrobotek', D),

  // ---- drzewa i krzewy na piargach (sprawozdania) ----
  e('Pinus mugo', 'kosodrzewina', W),
  e('Pinus cembra', 'limba', W),
  e('Picea abies', 'świerk pospolity', W),
  e('Larix decidua', 'modrzew europejski', W),
  e('Salix silesiaca', 'wierzba śląska', W),
  e('Sorbus aucuparia', 'jarząb pospolity', W),
  e('Sorbus aucuparia subsp. glabrata', 'jarząb pospolity górski', W),
  e('Juniperus communis subsp. alpina', 'jałowiec halny', W),
]

const BY_NAME = new Map(SPECIES_8110.map((s) => [normalizeName(s.latin), s]))
const BY_GENUS = new Map(SPECIES_8110.filter((s) => s.genus).map((s) => [normalizeName(s.latin.split(' ')[0]), s]))

/** Wpis katalogu; gatunek spoza katalogu z rodzaju mającego wpis „spp.” (np. Racomitrium lanuginosum) – wpis rodzaju. */
export function findSpecies8110(name: string): SpeciesEntry8110 | undefined {
  const n = normalizeName(name)
  return BY_NAME.get(n) ?? BY_GENUS.get(n.split(' ')[0])
}

/**
 * Klucz do liczenia gatunków: synonimy (Cardaminopsis/Arabidopsis, Festuca airoides/supina…) dają jeden klucz.
 * Gatunki z rodzaju „spp.” liczą się osobno (dwa różne skalniczki to dwa gatunki).
 */
export function speciesKey8110(name: string): string {
  const s = BY_NAME.get(normalizeName(name))
  return s ? s.polish.replace(/ \(syn\.\)$/, '') : normalizeName(name)
}

export const isTypical8110 = (name: string) => Boolean(findSpecies8110(name)?.typical)
/** Gatunek wysokogórski: znany katalogowi jako wysokogórski. Spoza katalogu – undefined (decyduje ekspert). */
export const alpineStatus8110 = (name: string): 'yes' | 'no' | 'unknown' => {
  const s = findSpecies8110(name)
  return !s ? 'unknown' : s.alpine ? 'yes' : 'no'
}
export const isWoody8110 = (name: string) => Boolean(findSpecies8110(name)?.woody)

export const defaultLayer8110 = (s: SpeciesEntry8110): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
