// Słownik gatunków dla 4060 (wysokogórskie borówczyska bażynowe Empetro-Vaccinietum), zebrany z przewodnika GIOŚ
// (Świerkosz 2012, rozdz. „Warunki ekologiczne” i „Typowe gatunki roślin”), z przykładowej karty (Kopa, 2011) i ze
// sprawozdań z monitoringu 2009–2011, 2016 i 2021. Siedlisko krzewinkowe: prawie wszystko w warstwie C (krzewinki,
// trawy, byliny), mszaki i porosty w D, kosodrzewina, jarząb i wierzba śląska – w B (siewki kosówki karta wpisuje do C).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup4060 =
  | 'diagnostic' // bażyna obupłciowa i borówka halna (w Górach Stołowych zastępczo bażyna czarna i borówka bagienna)
  | 'typical' // pozostałe typowe gatunki z rozdz. 4 przewodnika (krzewinki, byliny, mszaki, porosty)
  | 'dominantRisk' // gatunki, których dominacja obniża ocenę „gatunków dominujących” (sprawozdania 2016, 2021)
  | 'woody' // kosodrzewina i inne krzewy/drzewa wkraczające w płaty
  | 'companion' // inne gatunki z zdjęć fitosocjologicznych

export interface SpeciesEntry4060 {
  latin: string
  polish?: string
  group: SpeciesGroup4060
  /** Mszak albo porost – w zdjęciu warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_4060: Record<SpeciesGroup4060, string> = {
  diagnostic: 'gatunek charakterystyczny 4060 (wyznacznik Empetro-Vaccinietum)',
  typical: 'gatunek typowy dla siedliska (nie liczy się do „gatunków charakterystycznych”)',
  dominantRisk: 'gatunek, którego dominacja obniża ocenę „gatunków dominujących”',
  woody: 'krzew lub drzewo (ekspansja kosodrzewiny i krzewów)',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup4060, extra: Partial<SpeciesEntry4060> = {}): SpeciesEntry4060 => ({ latin, polish, group, ...extra })
const D = { cryptogam: true }

export const SPECIES_4060: SpeciesEntry4060[] = [
  // wyznaczniki zespołu – na nich opiera się wskaźnik „gatunki charakterystyczne” (praktyka 2021)
  e('Empetrum hermaphroditum', 'bażyna obupłciowa', 'diagnostic'),
  e('Empetrum nigrum subsp. hermaphroditum', 'bażyna obupłciowa', 'diagnostic'),
  e('Vaccinium gaultherioides', 'borówka halna', 'diagnostic'),
  e('Vaccinium uliginosum subsp. microphyllum', 'borówka halna', 'diagnostic'),
  e('Vaccinium uliginosum subsp. gaultherioides', 'borówka halna', 'diagnostic'),
  e('Empetrum nigrum', 'bażyna czarna', 'diagnostic'),
  e('Vaccinium uliginosum', 'borówka bagienna', 'diagnostic'),
  // gatunki, których dominacja świadczy o przechodzeniu w borówczysko czernicowe, wrzosowisko albo trzęślicowisko
  e('Vaccinium myrtillus', 'borówka czarna', 'dominantRisk'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'dominantRisk'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'dominantRisk'),
  e('Molinia caerulea', 'trzęślica modra', 'dominantRisk'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'dominantRisk'),
  e('Avenella flexuosa', 'śmiałek pogięty', 'dominantRisk'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'dominantRisk'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'dominantRisk'),
  // pozostałe gatunki typowe (rozdz. 4)
  e('Homogyne alpina', 'podbiałek alpejski', 'typical'),
  e('Huperzia selago', 'widłak wroniec', 'typical'),
  e('Diphasiastrum alpinum', 'widlicz alpejski', 'typical'),
  e('Juniperus communis subsp. alpina', 'jałowiec halny', 'typical'),
  e('Oreochloa disticha', 'boimka dwurzędowa', 'typical'),
  e('Polytrichum strictum', 'płonnik cienki', 'typical', D),
  e('Sphagnum rubellum', 'torfowiec czerwonawy', 'typical', D),
  e('Sphagnum cuspidatum', 'torfowiec szpiczastolistny', 'typical', D),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'typical', D),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'typical', D),
  e('Hylocomium splendens', 'gajnik lśniący', 'typical', D),
  e('Sphenolobus minutus', 'Sphenolobus minutus', 'typical', D),
  e('Anastrepta orcadensis', 'Anastrepta orcadensis', 'typical', D),
  e('Mylia taylori', 'Mylia taylori', 'typical', D),
  e('Mylia anomala', 'Mylia anomala', 'typical', D),
  e('Cetraria islandica', 'płucnica islandzka', 'typical', D),
  e('Cetraria nivalis', 'płucnica śnieżna', 'typical', D),
  e('Flavocetraria nivalis', 'płucnica śnieżna', 'typical', D),
  e('Cladonia rangiferina', 'chrobotek reniferowy', 'typical', D),
  e('Cladonia bellidiflora', 'chrobotek strojny', 'typical', D),
  e('Alectoria ochroleuca', 'włostka halna', 'typical', D),
  // krzewy i drzewa
  e('Pinus mugo', 'kosodrzewina', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),
  e('Sorbus aucuparia var. glabrata', 'jarząb pospolity (forma górska)', 'woody'),
  e('Salix silesiaca', 'wierzba śląska', 'woody'),
  e('Picea abies', 'świerk pospolity', 'woody'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody'),
  e('Betula pubescens', 'brzoza omszona', 'woody'),
  // towarzyszące (zdjęcia z karty Kopa i sprawozdania)
  e('Athyrium distentifolium', 'wietlica alpejska', 'companion'),
  e('Deschampsia cespitosa', 'śmiałek darniowy', 'companion'),
  e('Gentiana asclepiadea', 'goryczka trojeściowa', 'companion'),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'companion'),
  e('Veratrum lobelianum', 'ciemiężyca zielona', 'companion'),
  e('Juncus trifidus', 'sit skucina', 'companion'),
  e('Hieracium alpinum', 'jastrzębiec alpejski', 'companion'),
  e('Mutellina purpurea', 'marchwica pospolita', 'companion'),
  e('Pulsatilla alba', 'sasanka alpejska', 'companion'),
  e('Festuca airoides', 'kostrzewa niska', 'companion'),
  e('Carex bigelowii', 'turzyca sztywna', 'companion'),
  e('Polytrichum piliferum', 'płonnik włosisty', 'companion', D),
  e('Polytrichum commune', 'płonnik pospolity', 'companion', D),
  e('Cladonia sp.', 'chrobotek', 'companion', D),
]

const BY_NAME = new Map(SPECIES_4060.map((s) => [normalizeName(s.latin), s]))

export const findSpecies4060 = (name: string): SpeciesEntry4060 | undefined => BY_NAME.get(normalizeName(name))

export const isDiagnostic4060 = (name: string) => findSpecies4060(name)?.group === 'diagnostic'
export const isWoody4060 = (name: string) => findSpecies4060(name)?.group === 'woody'

/** Synonimy (Empetrum nigrum subsp. hermaphroditum = E. hermaphroditum…) dają ten sam klucz – polską nazwę z katalogu. */
export const speciesKey4060 = (name: string) => findSpecies4060(name)?.polish ?? normalizeName(name)

/** Mszaki i porosty do D, krzewy i drzewa do B, reszta do C. */
export const defaultLayer4060 = (s: SpeciesEntry4060): Layer => (s.cryptogam ? 'D' : s.group === 'woody' ? 'B' : 'C')
