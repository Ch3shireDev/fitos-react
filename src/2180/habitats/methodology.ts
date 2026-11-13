// Metodyka 2180 jako dane. Źródło: Lemke D. 2015. 2180 Lasy mieszane i bory na wydmach nadmorskich. W: Mróz W. (red.)
// „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Część IV”, GIOŚ, s. 75–86 (tab. 1 i 2, przykładowa karta),
// z praktyką ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2024 (nazwy wskaźników, połączenie „innych zniekształceń”
// ze zniszczeniami po pozyskaniu drewna, rezygnacja z „gatunków obcych ekologicznie”, „co najmniej 10%” drzew starych).
// Wspólne typy, ocena i formularz są w src/7120, klocki leśne w src/forest – tu są wyłącznie dane i progi 2180.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  choiceIndicator,
  dominantSpecies,
  ecoAlienTrees,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  gradeMap,
  labelOf,
  listCover,
  measureIndicator,
  otherDistortions,
  plNum,
  speciesInput,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_2180,
  SPECIES_2180,
  VARIANTS_2180,
  characteristicOf,
  characteristicSummary,
  defaultLayer2180,
  findSpecies2180,
  namesOfGroup,
  variantOf,
  type Variant2180,
} from './species'

// ---------- opcje selectów (z oceną, którą dają) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'slight', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
]

const CHARACTERISTIC: GradedOption[] = [
  { value: 'full', label: 'Występuje całe spektrum gatunków charakterystycznych dla zbiorowiska', grade: 'FV' },
  {
    value: 'most',
    label: 'Występuje większość gatunków charakterystycznych, ale brakuje najbardziej typowych lub występują sporadycznie',
    grade: 'U1',
  },
  { value: 'poor', label: 'Fitocenoza silnie zubożona florystycznie, brakuje większości gatunków charakterystycznych', grade: 'U2' },
]

const DOMINANCE: GradedOption[] = [
  { value: 'natural', label: 'Status dominanta osiągają gatunki charakterystyczne dla zbiorowiska', grade: 'FV' },
  { value: 'partly', label: 'Nie we wszystkich warstwach status dominanta osiągają gatunki charakterystyczne', grade: 'U1' },
  {
    value: 'foreign',
    label: 'Wśród dominantów obecne gatunki ekspansywne oraz ekologicznie lub geograficznie obce dla zbiorowiska',
    grade: 'U2',
  },
]

const EXPANSION: SelectOption[] = [
  { value: 'no', label: 'Nie – pojedyncze egzemplarze, bez ekspansji' },
  { value: 'yes', label: 'Tak – gatunek się rozprzestrzenia' },
]

const REGENERATING: SelectOption[] = [
  { value: 'no', label: 'Nie odnawiają się albo pojedyncze siewki' },
  { value: 'strong', label: 'Silnie się odnawiają (liczne siewki, podrost)' },
]

const DEAD_WOOD: GradedOption[] = [
  { value: 'above', label: 'Ponad 5 m³/ha', grade: 'FV' },
  { value: 'below', label: 'Poniżej 5 m³/ha, ale obecne', grade: 'U1' },
  { value: 'none', label: 'Brak martwego drewna', grade: 'U2' },
]

const REGENERATION: GradedOption[] = [
  { value: 'abundant', label: 'Występuje obficie, reaguje na pojawiające się prześwietlenia', grade: 'FV' },
  { value: 'single', label: 'Występuje, ale pojedynczo (sporadycznie)', grade: 'U1' },
  { value: 'none', label: 'Brak odnowienia', grade: 'U2' },
]

const DISTORTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Występują pojedynczo, bez znaczenia', grade: 'U1' },
  { value: 'strong', label: 'Silne', grade: 'U2' },
]

// ---------- progi tab. 2 ----------

/** Bażyna czarna w Empetro nigri-Pinetum: FV wymaga co najmniej st. 2 w skali Braun-Blanqueta, czyli ≥5% pokrycia. */
export const EMPETRUM_MIN_COVER = 5

/** Struktura wiekowa: udział drzew starych ≥10% FV, >0 U1, brak U2 (tab. 2 „>10%”, sprawozdania 2018/2024 „co najmniej 10%”). */
export const gradeOldTrees = (share: number): Grade => (share >= 10 ? 'FV' : share > 0 ? 'U1' : 'U2')

/** Obce ekologicznie w drzewostanie: <10% FV, 10–50% U1, >50% U2. */
export const gradeEcoAlien = (share: number): Grade => (share < 10 ? 'FV' : share <= 50 ? 'U1' : 'U2')

/** Obce geograficznie w drzewostanie i podroście: <1% FV, 1–10% U1, >10% U2 (silne odnawianie się – U2 niezależnie od udziału). */
export const gradeGeoAlien = (share: number): Grade => (share < 1 ? 'FV' : share <= 10 ? 'U1' : 'U2')

/** Martwe drewno: >5 m³/ha FV, mniej, ale obecne U1, brak U2. Równo 5 m³/ha nie „przekracza progu” → U1 (interpretacja). */
export const gradeDeadWood = (v: number): Grade => (v > 5 ? 'FV' : v > 0 ? 'U1' : 'U2')

/** Pokrycie „pojedynczych egzemplarzy” gatunku obcego, gdy obserwator nie określił ekspansji (interpretacja). */
export const SINGLE_COVER = 1

/**
 * Obce inwazyjne w podszycie i runie: brak FV; najwyżej pojedyncze egzemplarze jednego gatunku niewykazującego
 * ekspansji U1; więcej niż jeden gatunek albo jeden ekspansywny U2.
 */
export function gradeInvasive(c: { count: number; total?: number }, expansion: unknown): Grade | null {
  if (c.count === 0) return 'FV'
  if (c.count > 1 || expansion === 'yes') return 'U2'
  if (expansion === 'no') return 'U1'
  if (c.total === undefined) return null
  return c.total <= SINGLE_COVER ? 'U1' : 'U2'
}

interface EmpetrumCheck {
  /** Pokrycie bażyny z listy (undefined – brak na liście albo bez pokrycia). */
  cover?: number
  listed: boolean
  /** Ocena najwyżej U1, bo bażyna poniżej st. 2 B-B albo jej brak. */
  capped: boolean
}

function empetrumCheck(i: InputValues): EmpetrumCheck {
  const row = speciesRows(i.species).find((r) => r.name?.trim() && findSpecies2180(r.name)?.latin === 'Empetrum nigrum')
  const cover = row ? num(row.cover) : undefined
  return { cover, listed: Boolean(row), capped: !row || (cover !== undefined && cover < EMPETRUM_MIN_COVER) }
}

/**
 * Gatunki charakterystyczne: ocena z wyboru opisu (tab. 2 jest opisowa). W borze bażynowym FV wymaga bażyny czarnej
 * co najmniej w st. 2 skali Braun-Blanqueta – gdy na liście jej brak albo ma mniej niż 5%, podpowiedź spada do U1.
 */
export function gradeCharacteristic(i: InputValues, ctx?: IndicatorContext): Grade | null {
  const chosen = gradeMap(CHARACTERISTIC)[String(i.choice)]
  if (!chosen) return null
  if (chosen === 'FV' && variantOf(ctx?.site) === 'empetro' && empetrumCheck(i).capped) return 'U1'
  return chosen
}

// ---------- pomocnicze ----------

const variantLabel = (v?: Variant2180) => (v ? VARIANTS_2180[v].split(' – ')[0] : '')

const VARIANT_OPTIONS: SelectOption[] = (Object.keys(VARIANTS_2180) as Variant2180[]).map((v) => ({ value: v, label: VARIANTS_2180[v] }))

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie, np. stopnie-minuty-sekundy z N/E. Jeśli punkt ma oznaczenie w bazie, dopisz je.

Dlaczego: transekt trzeba odnaleźć za 5–6 lat (cykle 2013, 2018, 2024). W tych samych punktach (początek, środek po 100 m, koniec) wykonuje się zdjęcia fitosocjologiczne 10×10 m.`

export const methodology2180: Methodology = {
  code: '2180',
  name: 'Lasy mieszane i bory na wydmach nadmorskich',
  source:
    'Lemke D. 2015. 2180 Lasy mieszane i bory na wydmach nadmorskich. W: Mróz W. (red.) Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. IV, GIOŚ, s. 75–86 (tab. 1 i 2), z praktyką sprawozdań z monitoringu 2013–2014, 2016–2018 i 2024',

  siteFields: forestSiteFields({
    code: '2180',
    transect: '200x10 m',
    releveArea: 100,
    dateWindow: [6, 9],
    extra: [
      {
        kind: 'select',
        name: 'variant',
        label: 'Zbiorowisko (wariant siedliska)',
        options: VARIANT_OPTIONS,
        required: true,
        hint: 'Od zbiorowiska zależy lista gatunków charakterystycznych i warunek z bażyną czarną.',
        help: `Wybierz zbiorowisko, które reprezentuje płat na transekcie:
• Empetro nigri-Pinetum – nadmorski bór bażynowy: sosna zwyczajna z domieszką brzozy, w runie krzewinki (bażyna czarna, borówka brusznica, wrzos), runo mszyste o dużym pokryciu; postać wilgotna z wrzoścem bagiennym i borówką bagienną;
• Betulo pendulae-Quercetum roboris – nadmorski las brzozowo-dębowy: dąb szypułkowy, brzozy, silnie rozwinięty podszyt (kruszyna, jarząb, wiciokrzew pomorski), w runie kosmatka owłosiona, orlica, borówka czarna, w postaci wilgotnej trzęślica.

Drzewostan zastępczy (np. sosna na siedlisku Betulo-Quercetum, regenerujący się w kierunku lasu brzozowo-dębowego) przypisz do zbiorowiska, w które się przekształca, i opisz to w „Zbiorowiskach roślinnych”.

Dlaczego: przewodnik podaje osobne listy gatunków charakterystycznych dla obu zbiorowisk. W borze bażynowym ocena właściwa wymaga bażyny czarnej co najmniej w st. 2 skali Braun-Blanqueta.`,
      },
    ],
    overrides: {
      siteName: {
        placeholder: 'np. Białogóra',
        help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Białogóra”, „Hel Centrum”, „Smołdziński Las”. Jeśli stanowisko jest już w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: siedlisko 2180 monitoruje się co 5–6 lat na tej samej sieci ok. 46 stanowisk (cykle 2013, 2018, 2024). Stała nazwa razem z GUID pozwala zestawić kolejne karty i policzyć trend.`,
      },
      communities: {
        placeholder: 'np. Empetro nigri-Pinetum',
        help: `Zbiorowiska na stanowisku, nazwami fitosocjologicznymi: Empetro nigri-Pinetum (nadmorski bór bażynowy) albo Betulo pendulae-Quercetum roboris (nadmorski las brzozowo-dębowy). Zaznacz postać wilgotną i drzewostany zastępcze, np. „Empetro nigri-Pinetum, postać wilgotna z Erica tetralix” albo „drzewostan zastępczy z Pinus nigra”.

Dlaczego: znaczna część zasobów 2180 to drzewostany zastępcze sztucznego pochodzenia (sosna kosa i czarna sadzone do utrwalania wydm), w różnym stopniu regeneracji. Bez tej informacji nie da się porównać ocen między stanowiskami.`,
      },
      description: {
        hint: 'Położenie na wydmach (pas od plaży), drzewostan (gatunki, wiek, pochodzenie), podszyt, runo, presja turystyczna, zarządzający terenem.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• położenie: wydmy szare, brunatne, obniżenia międzywydmowe; odległość od plaży, ślady abrazji brzegu;
• drzewostan: gatunki, wiek, pochodzenie (naturalny czy sadzony na wydmach), obecność sosny kosy, czarnej, Banksa;
• podszyt i odnowienie: sosna, dąb, jarząb, buk, czeremcha amerykańska;
• runo: bażyna, krzewinki, trawy, mchy, postać wilgotna;
• presja turystyczna: ścieżki, przejścia na plażę, biwaki, zabudowa;
• zarządzający terenem (nadleśnictwo, park narodowy, urząd morski).

Dlaczego: kolejny obserwator musi odróżnić naturalną dynamikę (regeneracja drzewostanów zastępczych) od skutków gospodarki i ruchu turystycznego.`,
      },
      areaHa: {
        help: `Powierzchnia płatu (lub płatów) siedliska 2180 na stanowisku, w hektarach – nie powierzchnia transektu. Przewodnik podaje typowo od kilku do kilkudziesięciu hektarów; najlepiej z Leśnej Mapy Numerycznej i opisów taksacyjnych.

Dlaczego: zmiana powierzchni płatu między cyklami monitoringu to podstawa parametru „Powierzchnia siedliska”. Spadek wynika zwykle z abrazji brzegu morskiego.`,
      },
      coordStart: { placeholder: 'N 54°49′…″; E 17°57′…″', help: COORD_HELP('początku') },
      coordMiddle: { help: COORD_HELP('środka') },
      coordEnd: { help: COORD_HELP('końca') },
      transect: {
        help: `Faktyczne wymiary transektu. Standard to pas 10×200 m. Gdy nie da się go wyznaczyć (wąski pas lasu między plażą a zabudową), przewodnik każe zastąpić go powierzchnią 1 ha o innych wymiarach – wpisz faktyczne wymiary.

Dlaczego: pokrycia gatunków i udziały liczy się względem transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
      },
      altitude: {
        placeholder: 'np. 10',
        help: 'Wysokość nad poziomem morza w metrach, z GPS albo mapy. Na wydmach podaj zakres (np. „5–10”), bo grzbiety i obniżenia międzywydmowe różnią się roślinnością.',
      },
      date: {
        placeholder: 'DD.MM.RRRR, np. 19.07.2024',
        hint: 'Optymalnie od czerwca do września – w fenologicznym optimum fitocenoz leśnych.',
        help: `Dzień obserwacji w terenie. Przewodnik zaleca czerwiec–wrzesień (fenologiczne optimum fitocenoz leśnych w regionie). W 2024 r. prace prowadzono od 20 czerwca do 20 sierpnia. Karta przykładowa z przewodnika (Białogóra, 19.10.2013) jest spoza tego okna, a jej autor w uwagach metodycznych proponuje maj–czerwiec i wrzesień–październik, poza sezonem turystycznym.

Dlaczego: formularz ostrzega o terminie poza czerwcem–wrześniem. Sprawozdanie 2018 nie stwierdziło, żeby późniejszy termin zmieniał wyniki, ale trzymaj się okna, jeśli możesz.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne klasyczną metodą Braun-Blanqueta, co 100 m wzdłuż transektu (na początku, w środku i na końcu), każde na poletku 10×10 m (100 m²). Mszaki wpisuj w warstwie D – w borze bażynowym runo mszyste ma zwykle bardzo duże pokrycie. Liczbę zdjęć możesz zmieniać.',
    fields: forestReleveFields({
      area: 100,
      helps: {
        coverA:
          'Warstwa A – drzewostan: procent powierzchni zdjęcia przykryty koronami drzew. W borze bażynowym zwykle 40–70% (widne bory), w lesie brzozowo-dębowym więcej.\n\nDlaczego: zwarcie decyduje o świetle w runie i o tym, czy sosna i dąb mogą się odnawiać w lukach.',
        coverB:
          'Warstwa B – krzewy i podrost: sosna, jarząb, kruszyna, wiciokrzew, czeremcha. W borze bażynowym często 0%, w lesie brzozowo-dębowym silnie rozwinięta.\n\nDlaczego: dominacja buka, czeremchy amerykańskiej albo róży pomarszczonej w podszycie obniża ocenę gatunków dominujących i obcych.',
        coverC:
          'Warstwa C – krzewinki i rośliny zielne: bażyna, borówki, wrzos, turzyca piaskowa, śmiałek; w lesie brzozowo-dębowym kosmatka, orlica, trzęślica.\n\nDlaczego: od składu runa zależy ocena gatunków charakterystycznych – w borze bażynowym kluczowa jest bażyna czarna.',
        coverD:
          'Warstwa D – mszaki (gajnik lśniący, rokietnik, brodawkowiec czysty, widłozęby). W borze bażynowym często 70–90%.\n\nDlaczego: przewodnik opisuje runo boru bażynowego jako „najczęściej mszyste” – mała warstwa mszysta to sygnał zniekształcenia (wydeptywanie, zaśmiecenie).',
        unit: 'Zbiorowisko, do którego należy zdjęcie: „Empetro nigri-Pinetum” albo „Betulo-Quercetum”. Drzewostan zastępczy zaznacz wprost (np. „drzewostan zastępczy z Pinus mugo”).\n\nDlaczego: łączy zdjęcie z wariantem siedliska wybranym w „Stanowisku”.',
      },
    }),
  },

  indicators: [
    forestArea({
      options: AREA,
      inputLabel: 'Jak zmienia się powierzchnia?',
      inputHelp: 'Wybierz kierunek zmiany powierzchni płatu.',
      label: 'Powierzchnia siedliska na stanowisku',
      description: 'Zmiana powierzchni płatu siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
      help: `Co wybrać: jak zmieniła się powierzchnia płatu 2180 od poprzedniej obserwacji. W polu wartości podaj powierzchnię i źródło porównania, np. „20,0 ha, bez zmian od 2018 r.”. Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i napisz to w opisie.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; niewielki spadek – U1; wyraźny spadek w porównaniu z wcześniejszymi badaniami lub literaturą – U2.

Dlaczego: na kilku stanowiskach (Kuźnica, Pustkowo, Sarbinowo) drzewostany sąsiadują bezpośrednio z plażą – abrazja brzegu i podnoszenie się poziomu morza zabierają płat od strony morza. W 2024 r. 80% stanowisk miało ten parametr w stanie właściwym.`,
    }),
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne',
      parameter: 'structure',
      cardinal: true,
      description:
        'Typowość składu gatunkowego fitocenozy: liczba gatunków charakterystycznych dla zbiorowiska i obfitość ich występowania, z przybliżonym procentem pokrycia transektu.',
      help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie z pokryciem w %, a potem wybierz opis z tab. 2. Formularz pokazuje, ile pozycji listy zbiorowiska jest obecnych, ale ocena wynika z wyboru – tab. 2 jest opisowa.

Listy (tab. 1 przewodnika):
• Empetro nigri-Pinetum – przyjęte za charakterystyczne: bażyna czarna Empetrum nigrum, turzyca piaskowa Carex arenaria, tajęża jednostronna Goodyera repens, gruszyczka jednokwiatowa Moneses uniflora; typowe gatunki borowe: siódmaczek, pszeniec zwyczajny, borówka brusznica, śmiałek pogięty, wrzos; w postaci wilgotnej wrzosiec bagienny i borówka bagienna; drzewostan – sosna z domieszką brzozy brodawkowatej; podszyt – jarząb, wierzba piaskowa;
• Betulo pendulae-Quercetum roboris – dąb szypułkowy, brzoza omszona, dąb bezszypułkowy; kruszyna, czeremcha zwyczajna, w części zachodniej wiciokrzew pomorski; w runie kosmatka owłosiona, orlica, siódmaczek, borówka czarna, trzęślica modra (postać wilgotna), groszek skrzydlasty.

Progi (tab. 2): całe spektrum gatunków charakterystycznych, w Empetro nigri-Pinetum niezbędna bażyna czarna co najmniej w st. 2 skali Braun-Blanqueta (≥5%) – FV; większość gatunków, ale brakuje najbardziej typowych lub występują sporadycznie (np. bażyna najwyżej w st. 1) – U1; fitocenoza silnie zubożona, brak większości gatunków – U2. Gdy w borze bażynowym wybierzesz FV, a bażyny nie ma na liście albo ma mniej niż 5%, formularz podpowie U1.

Dlaczego: w 2018 r. głównym powodem oceny U2 był brak bażyny czarnej w Empetro nigri-Pinetum. Dobrze zachowane bory bażynowe są na Helu (na wschód od Juraty), koło Białogóry i Ustki; dobrze zachowanego Betulo-Quercetum w 2013 r. nie stwierdzono. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Występuje całe spektrum gatunków charakterystycznych dla zbiorowiska. W Empetro nigri-Pinetum niezbędne jest występowanie bażyny czarnej Empetrum nigrum przynajmniej w st. 2 wg skali Braun-Blanqueta',
        U1: 'Występuje większość gatunków charakterystycznych dla zbiorowiska, ale brakuje gatunków najbardziej typowych lub występują sporadycznie (np. Empetrum nigrum w Empetro nigri-Pinetum najwyżej w st. 1 wg skali Braun-Blanqueta)',
        U2: 'Fitocenoza silnie zubożona pod względem florystycznym, brakuje większości gatunków charakterystycznych',
      },
      inputs: [
        speciesInput(
          'Gatunki charakterystyczne',
          'Gatunki charakterystyczne zbiorowiska stwierdzone na transekcie, z pokryciem w % (z dokładnością do 10%, dla „<1%” wpisz 0,5). W borze bażynowym wpisz koniecznie bażynę czarną z pokryciem – st. 2 w skali Braun-Blanqueta to 5–25%.',
          true,
        ),
        {
          kind: 'select',
          name: 'choice',
          label: 'Ocena składu gatunkowego',
          options: CHARACTERISTIC,
          required: true,
          help: 'Wybierz opis z tab. 2 najbliższy temu, co widać na transekcie. Ocena jest ekspercka: liczy się nie tylko liczba gatunków z listy, ale też obfitość ich występowania.',
        },
      ],
      suggest: gradeCharacteristic,
      explain: (i, ctx) => {
        const v = variantOf(ctx?.site)
        if (!v) return 'Wybierz zbiorowisko w „Stanowisku” – od niego zależy lista gatunków charakterystycznych.'
        const s = characteristicSummary(speciesRows(i.species), v)
        if (!s.present.length) return null
        const parts = [
          `${variantLabel(v)}: z listy ${characteristicOf(v).length} gatunków obecnych ${s.present.length} (${plNum(s.percent)}%).`,
        ]
        if (v === 'empetro') {
          const e = empetrumCheck(i)
          parts.push(
            !e.listed
              ? 'Brak bażyny czarnej na liście – ocena najwyżej U1.'
              : e.cover === undefined
                ? 'Bażyna czarna bez pokrycia – wpisz je, żeby sprawdzić warunek st. 2 B-B.'
                : e.cover < EMPETRUM_MIN_COVER
                  ? `Bażyna czarna ${fmt(e.cover)} – poniżej st. 2 B-B (5%), ocena najwyżej U1.`
                  : `Bażyna czarna ${fmt(e.cover)} – warunek st. 2 B-B spełniony.`,
          )
        }
        return parts.join(' ')
      },
      warn: (i) => {
        const bad = namesOfGroup(speciesRows(i.species), 'alien', 'eco-alien')
        return bad.length ? `Na liście są gatunki obce (${bad.join(', ')}) – wpisz je we właściwym wskaźniku.` : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || labelOf(CHARACTERISTIC, i.choice),
    },
    dominantSpecies({
      label: 'Gatunki dominujące w poszczególnych warstwach fitocenozy',
      description:
        'Lista kilku gatunków, które osiągają największe pokrycie na transekcie w poszczególnych warstwach, z przybliżonym procentem pokrycia transektu.',
      help: `Co wpisać: dominanty każdej warstwy z pokryciem w % transektu (A – drzewostan, B – podszyt, C – runo, D – mszaki), najwyżej po kilka gatunków, i wybierz opis z tab. 2. Warstwę dopisz w polu wartości („A: sosna zwyczajna 60%; C: borówka brusznica 30%…”).

Progi (tab. 2): status dominanta osiągają gatunki charakterystyczne – FV; nie we wszystkich warstwach – U1; wśród dominantów gatunki ekspansywne albo ekologicznie lub geograficznie obce – U2. Formularz ostrzega, gdy wybierzesz FV, a z pokryciem ≥10% dominuje gatunek obcy.

Dlaczego: w 2018 r. U2 dawała najczęściej dominacja w warstwie A sosny czarnej, kosodrzewiny, sosny Banksa lub dębu czerwonego, a w warstwie B – buka, obcego ekologicznie dla tego siedliska. W 2024 r. 20% stanowisk miało ten wskaźnik w stanie złym. Wskaźnik pomocniczy.`,
      options: DOMINANCE,
      inputLabel: 'Czy dominują gatunki charakterystyczne?',
      inputHelp: 'Wybierz opis z tab. 2 najbliższy temu, co widać na transekcie.',
      flag: (name) => {
        const g = findSpecies2180(name)?.group
        return g === 'alien' || g === 'eco-alien'
      },
      flagText: 'gatunek obcy geograficznie lub ekologicznie (tab. 2: U2)',
    }),
    {
      id: 'invasive',
      label: 'Obce gatunki inwazyjne w podszycie i runie',
      parameter: 'structure',
      description:
        'Gatunki obce geograficznie i ekologicznie w podszycie i runie z szacunkowym procentem pokrycia transektu. Od 2018 r. w sprawozdaniach: „Ekspansywne gatunki obce w podszycie i runie”.',
      help: `Co wpisać: każdy gatunek obcy w podszycie i runie, z pokryciem w % transektu, i czy wykazuje ekspansję. Brak – zostaw pustą listę.

Na wybrzeżu najczęściej: czeremcha amerykańska Padus serotina, dąb czerwony Quercus rubra (podrost), róża pomarszczona Rosa rugosa, śnieguliczka, niecierpek drobnokwiatowy. Tab. 1 wymienia też rdestowce, nawłocie, barszcze, słonecznik bulwiasty, przymiotno białe, łubin trwały i szczaw omszony – na ocenę wpływa już sama obecność gatunku.

Progi (tab. 2): brak gatunków inwazyjnych – FV; co najwyżej pojedyncze egzemplarze jednego gatunku niewykazującego ekspansji – U1; więcej niż jeden gatunek albo jeden wykazujący ekspansję – U2. Bez odpowiedzi „czy wykazuje ekspansję” formularz uzna pokrycie do ${SINGLE_COVER}% za „pojedyncze egzemplarze” (interpretacja).

Dlaczego: na ocenę składa się inwazyjność gatunku i obfitość występowania. Czeremchę amerykańską stwierdzono w 2013 r. na 4, w 2024 r. już na 14 stanowiskach. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak gatunków inwazyjnych',
        U1: 'Obecne co najwyżej pojedyncze egzemplarze jednego gatunku niewskazującego na ekspansję',
        U2: 'Więcej niż jeden gatunek lub jeden gatunek wykazujący ekspansję',
      },
      inputs: [
        speciesInput(
          'Gatunki obce w podszycie i runie',
          'Gatunki obce z pokryciem w % transektu (dla „<1%” wpisz 0,5). Brak – zostaw pustą listę.',
        ),
        {
          kind: 'select',
          name: 'expansion',
          label: 'Czy gatunek wykazuje ekspansję?',
          options: EXPANSION,
          help: `Przy jednym gatunku: czy to pojedyncze egzemplarze, czy gatunek się rozprzestrzenia (liczne siewki, odrosty, płaty). Pole opcjonalne – bez niego formularz uzna pokrycie do ${SINGLE_COVER}% za pojedyncze egzemplarze (interpretacja).`,
        },
      ],
      suggest: (i) => gradeInvasive(listCover(i), i.expansion),
      explain: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return null
        return `Gatunków: ${count}, łączne pokrycie ${fmt(total)}.${count > 1 ? ' Więcej niż jeden gatunek – U2.' : ''}`
      },
      warn: (i) => {
        const native = speciesRows(i.species)
          .filter((r) => r.name?.trim())
          .filter((r) => {
            const g = findSpecies2180(r.name)?.group
            return g !== undefined && g !== 'alien'
          })
          .map((r) => r.name.trim())
        return native.length ? `${native.join(', ')} – to nie gatunki obce geograficznie. Buk wpisz w „Gatunkach dominujących”.` : null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (!list) return 'Brak'
        return i.expansion === 'yes' ? `${list} – wykazuje ekspansję` : list
      },
    },
    {
      ...measureIndicator({
        id: 'age',
        label: 'Struktura wiekowa',
        description:
          'Szacowany w skali transektu i w zasięgu wzroku udział powierzchniowy (projekcje koron) drzew starych – starszych niż 80–100 lat.',
        help: `Co wpisać: jaki procent powierzchni transektu (i otoczenia w zasięgu wzroku) przykrywają korony drzew starych, starszych niż 80–100 lat. Wiek sprawdź w opisie taksacyjnym planu urządzenia lasu – słaba bonitacja sosny na wydmach sugeruje młodszy wiek, niż jest naprawdę. Gdy cały drzewostan ma ponad 100 lat, wpisz 100%.

Progi (tab. 2): ponad 10% udziału drzew starych – FV; mniej niż 10%, ale drzewa stare obecne – U1; brak drzew starych – U2. Równo 10% formularz uznaje za FV, bo sprawozdania 2018 i 2024 piszą „co najmniej 10%” (interpretacja).

Dlaczego: bezpośrednio za wydmami rośnie zwykle wąski pas młodych drzewostanów sadzonych, dalej często ponad 100-letnie bory. W 2018 r. U2 dawał brak drzew starszych niż 80 lat na transekcie. Wskaźnik pomocniczy.`,
        thresholds: {
          FV: '>10% udział drzew starych',
          U1: 'Udział drzew starych mniejszy niż 10%, ale drzewa stare obecne',
          U2: 'Brak drzew starych',
        },
        field: {
          name: 'oldShare',
          label: 'Udział drzew starych (>80–100 lat)',
          unit: '%',
          max: 100,
          help: 'Udział powierzchniowy (projekcja koron) drzew starszych niż 80–100 lat, w %. Drzewostan w całości ponad 100-letni – 100. Brak drzew starych – 0.',
        },
        grade: gradeOldTrees,
      }),
      inputs: [
        {
          kind: 'number',
          name: 'oldShare',
          label: 'Udział drzew starych (>80–100 lat)',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Udział powierzchniowy (projekcja koron) drzew starszych niż 80–100 lat, w %. Drzewostan w całości ponad 100-letni – 100. Brak drzew starych – 0.',
        },
        {
          kind: 'number',
          name: 'standAge',
          label: 'Wiek drzewostanu',
          unit: 'lat',
          min: 0,
          max: 300,
          help: 'Wiek drzewostanu z opisu taksacyjnego (dla drzewostanów dwupiętrowych – piętra górnego). Pole opcjonalne, tylko do opisu.',
        },
      ],
      describe: (i) => {
        const s = num(i.oldShare)
        const a = num(i.standAge)
        return [s === undefined ? '' : `drzewa stare ${fmt(s)}`, a === undefined ? '' : `wiek drzewostanu ${plNum(a)} lat`]
          .filter(Boolean)
          .join(', ')
      },
    },
    ecoAlienTrees({
      label: 'Gatunki obce ekologicznie w drzewostanie',
      description:
        'Szacowany w skali transektu procentowy udział gatunków drzew rodzimych, ale obcych ekologicznie dla zbiorowiska (np. buk w borze bażynowym).',
      help: `Co wpisać: rodzime gatunki drzew niezgodne ze zbiorowiskiem, z udziałem w drzewostanie w %. Gatunków obcych geograficznie (sosna czarna, kosa, Banksa, dąb czerwony) tu nie wpisuj – mają osobny, kardynalny wskaźnik.

Progi (tab. 2): poniżej 10% – FV; 10–50% – U1; ponad 50% – U2.

Status: wskaźnik jest w tab. 2 przewodnika i oceniano go w latach 2013–2014, ale od 2018 r. GIOŚ go nie ocenia (sprawozdanie 2016–2018, pkt 9), a w 2024 r. stan oceniano 9 wskaźnikami bez niego. Przykładowa karta z przewodnika też go nie ma. Formularz pozwala go wpisać, ale nie liczy go do oceny struktury i funkcji.

Dlaczego: buk zwyczajny pojawia się w podszycie w pobliżu buczyn (zachodnia część Mierzei Wiślanej, okolice Ustki) – jego dominację w warstwie B sprawozdanie 2018 oceniało w „Gatunkach dominujących”.`,
      thresholds: { FV: '<10%', U1: '10–50%', U2: '>50%' },
      excluded: true,
      excludedNote: 'nie oceniany od 2018 r. – nie liczy się do oceny struktury',
      grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeEcoAlien(total)),
      inputHelp: 'Rodzime gatunki drzew obce ekologicznie dla zbiorowiska, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
    }),
    {
      id: 'geoAlien',
      label: 'Gatunki obce geograficznie w drzewostanie i podroście',
      parameter: 'structure',
      cardinal: true,
      description:
        'Szacowany w skali transektu procentowy udział gatunków obcych geograficznie: głównie świerk pospolity, kosodrzewina, sosna czarna i sosna wydmowa.',
      help: `Co wpisać: gatunki drzew i krzewów obce geograficznie w drzewostanie i podroście, z udziałem w % transektu, oraz czy silnie się odnawiają. Brak – zostaw pustą listę.

Wskaźnik dotyczy głównie świerka pospolitego Picea abies i kosodrzewiny Pinus mugo, ale też sosny czarnej Pinus nigra i sosny wydmowej Pinus contorta – do niedawna sadzono je na wydmach do ich utrwalenia. W sprawozdaniach także sosna Banksa, sosna wejmutka, dąb czerwony, czeremcha amerykańska, róża pomarszczona.

Progi (tab. 2): poniżej 1% – FV; 1–10% – U1; ponad 10% albo silnie odnawiające się niezależnie od udziału – U2.

Dlaczego: drzewostany zastępcze z kosodrzewiną (Białogóra, Słowiński PN, okolice Ustki) i sosną czarną (Mierzeja Wiślana) zmieniają charakter zbiorowiska. W 2024 r. sosnę czarną notowano na 14 stanowiskach. Wskaźnik kardynalny.`,
      thresholds: {
        FV: '<1%',
        U1: '1–10%',
        U2: '>10% lub silnie odnawiające się niezależnie od udziału',
      },
      inputs: [
        speciesInput(
          'Gatunki obce geograficznie w drzewostanie i podroście',
          'Gatunki drzew i krzewów obce geograficznie, z udziałem w % transektu (dla „<1%” wpisz 0,5). Brak – zostaw pustą listę.',
        ),
        {
          kind: 'select',
          name: 'regenerating',
          label: 'Czy silnie się odnawiają?',
          options: REGENERATING,
          help: 'Czy pod drzewostanem są liczne siewki albo podrost gatunku obcego. Silne odnawianie się daje U2 niezależnie od udziału (tab. 2) – gatunek sam się rozprzestrzenia po wydmach.',
        },
      ],
      suggest: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return 'FV'
        if (i.regenerating === 'strong') return 'U2'
        return total === undefined ? null : gradeGeoAlien(total)
      },
      explain: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return null
        return `Łączny udział gatunków obcych geograficznie: ${fmt(total)}${i.regenerating === 'strong' ? ', silnie się odnawiają – U2' : ''}.`
      },
      warn: (i) => {
        const own = speciesRows(i.species)
          .filter((r) => r.name?.trim())
          .filter((r) => {
            const g = findSpecies2180(r.name)?.group
            return g === 'tree' || g === 'shrub' || g === 'eco-alien'
          })
          .map((r) => r.name.trim())
        return own.length ? `${own.join(', ')} to gatunki rodzime – nie wpisuj ich jako obcych geograficznie.` : null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (!list) return 'Nie występują'
        return i.regenerating === 'strong' ? `${list} (silnie się odnawia)` : list
      },
    },
    measureIndicator({
      id: 'deadWood',
      label: 'Martwe drewno (łączne zasoby)',
      description: 'Szacowana na transekcie oraz w zasięgu wzroku miąższość obumierających i martwych drzew, w m³/ha.',
      help: `Co wybrać: klasę zasobów martwego drewna (leżące i stojące, obumierające i martwe drzewa) na transekcie i w zasięgu wzroku. Jeśli szacowałeś objętość, wpisz ją – formularz sprawdzi zgodność z klasą.

Progi (tab. 2): ponad 5 m³/ha – FV; poniżej 5 m³/ha, ale obecne – U1; brak – U2. Równo 5 m³/ha formularz liczy jako U1, bo zasoby mają „przekraczać próg” (interpretacja).

Dlaczego: w borach na ubogich wydmach zasobność drzewostanów jest niska, więc próg jest dużo niższy niż w innych lasach. Najczęstsze oddziaływanie na 2180 to usuwanie martwych i umierających drzew (cięcia sanitarne) – w 2013 r. na 38 z 48 stanowisk. Duże zasoby są w Słowińskim PN i rezerwatach Białogóra i Widowo. Wskaźnik pomocniczy.`,
      thresholds: { FV: '>5 m³/ha', U1: '<5 m³/ha, ale obecne', U2: 'Brak' },
      options: DEAD_WOOD,
      inputLabel: 'Zasoby martwego drewna',
      inputHelp: 'Wybierz klasę. Gdy szacowałeś objętość, wpisz ją też poniżej.',
      field: {
        name: 'volume',
        label: 'Zasoby martwego drewna (jeśli szacowane)',
        unit: 'm³/ha',
        help: 'Szacowana objętość martwego drewna leżącego i stojącego, w m³/ha. Pole opcjonalne – ocena idzie z klasy, a liczba ma pierwszeństwo, gdy ją podasz.',
      },
      grade: gradeDeadWood,
    }),
    choiceIndicator({
      id: 'regeneration',
      label: 'Naturalne odnowienie drzewostanu',
      description: 'Obserwowana na transekcie i w zasięgu wzroku obecność odnowienia naturalnego typowych dla zbiorowiska gatunków drzew.',
      help: `Co wpisać: gatunki odnowienia (siewki, podrost) z pokryciem w % i wybierz opis z tab. 2. Liczą się gatunki typowe dla zbiorowiska: w borze bażynowym głównie sosna (silnie reaguje na luki i prześwietlenia), w lesie brzozowo-dębowym dąb szypułkowy, brzozy, jarząb.

Progi (tab. 2): występuje obficie, reaguje na pojawiające się prześwietlenia – FV; występuje, ale pojedynczo – U1; brak – U2.

Dlaczego: odnowienie decyduje o trwałości siedliska. Obfite odnowienie dębu, brzozy i jarzębu pod sosną na żyźniejszych miejscach świadczy o regeneracji drzewostanów zastępczych w kierunku Betulo-Quercetum. W 2024 r. 65% stanowisk miało ten wskaźnik na U1. Wskaźnik pomocniczy.`,
      options: REGENERATION,
      inputLabel: 'Ilość odnowienia',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie i w zasięgu wzroku.',
      before: [
        speciesInput(
          'Gatunki odnowienia',
          'Gatunki odnowienia naturalnego z pokryciem w % transektu, np. „Pinus sylvestris 5”, „Quercus robur 0,5”. Pole opcjonalne – ocena wynika z wyboru poniżej.',
        ),
      ],
    }),
    otherDistortions({
      id: 'distortions',
      label: 'Inne zniekształcenia, w tym zniszczenia runa i gleby związane z pozyskaniem drewna',
      description:
        'Obserwowane na transekcie i w zasięgu wzroku zniszczenia runa spowodowane pracami leśnymi (rozjeżdżanie, wydeptanie, zaśmiecenie), uszkodzenia runa, gleby, podszytu i podrostów.',
      help: `Co wybrać: jak silne są zniekształcenia płatu – i te po pracach leśnych (zrywka, rozjeżdżenie, zniszczenie runa przy cięciach), i te od ruchu turystycznego (wydeptanie, przejścia na plażę, biwaki, zaśmiecenie). W polu wartości opisz, co i gdzie.

Sam fakt pozyskania drewna i obecność pniaków to jeszcze nie zniekształcenie – liczy się intensywność presji na runo i powierzchnię gleby. Ekstensywne użytkowanie nie powinno automatycznie obniżać oceny. Najczęściej spotkasz zaśmiecenie (niekiedy masowe) w pobliżu szlaków, parkingów śródleśnych i ośrodków turystycznych.

Progi (tab. 2): brak – FV; występują pojedynczo, bez znaczenia – U1; silne – U2.

Status: do 2014 r. oceniano osobno „Zniszczenia runa i gleby związane z gospodarką leśną” i „Inne zniekształcenia”; w 2018 r. połączono je w ten jeden wskaźnik (tak też jest w tab. 2 i w karcie z przewodnika). W 2024 r. znów podano je osobno, ale pochodzenia uszkodzeń na 74% stanowisk nie dało się ustalić (XX). Formularz trzyma się tab. 2.

Dlaczego: w 2018 r. najczęstszą przyczyną U2 było wydeptywanie. Wskaźnik pomocniczy, wskaźnik jakości.`,
      thresholds: { FV: 'Brak', U1: 'Występują pojedynczo, bez znaczenia', U2: 'Silne' },
      options: DISTORTIONS,
      inputLabel: 'Zniekształcenia',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie i w zasięgu wzroku.',
    }),
  ],

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu. Zwróć uwagę na:
• gospodarkę leśną – czy martwe drewno będzie pozostawiane, czy stosuje się rębnie złożone z odnowieniem naturalnym, czy płat jest wyłączony z użytkowania (rezerwat, park narodowy);
• ruch turystyczny – ścieżki, zejścia na plażę, biwaki, rozbudowę miejscowości i infrastruktury;
• morze – abrazję brzegu, sztormy, podnoszenie się poziomu morza;
• drzewostany zastępcze – czy regenerują się (dąb, brzoza pod sosną), czy obce sosny i czeremcha amerykańska się rozprzestrzeniają.

Przewodnik: najwłaściwsza forma ochrony to ekstensywna gospodarka leśna z pozostawianiem obumierających i martwych drzew, rębniami złożonymi i fragmentami drzewostanów do naturalnego rozwoju. Regeneracja jest powolna i tradycyjne zabiegi mają na nią niewielki wpływ.

Dlaczego: perspektywy to osobny parametr oceny ogólnej. W 2024 r. 44% stanowisk miało je w stanie właściwym.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska dobre, przy czym obserwowany jest wpływ czynników zagrażających, które jednak w dłuższej perspektywie czasowej nie powinny zagrozić zasobom siedliska',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  // Kody leśne ze wspólnej listy + kody ze sprawozdań 2013–2014, 2016–2018 i 2024 dla 2180.
  impactCodes: [
    ...FOREST_IMPACT_CODES.filter((c) => c.code !== 'G01.02'),
    { code: 'B02.05', name: 'Nieintensywna produkcja drewna (pozostawianie martwych i starych drzew)' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, rekreacji, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki i odpady stałe' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży' },
    { code: 'K01.01', name: 'Erozja (abrazja brzegu)' },
    { code: 'M01.07', name: 'Zmiany poziomu morza' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ].sort((x, y) => x.code.localeCompare(y.code)),

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. storczyki (kruszczyk rdzawoczerwony, tajęża, gruszyczka), wyjątkowo rozległe i dobrze zachowane płaty.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 2180: rzadkie i chronione rośliny (kruszczyk rdzawoczerwony Epipactis atrorubens – w 2024 r. na 2 stanowiskach, tajęża jednostronna, gruszyczka jednokwiatowa, woskownica europejska), sąsiedztwo innych siedlisk wydmowych, wyjątkowo rozległy lub dobrze zachowany płat. Brak – „Nie stwierdzono”.

Dlaczego: podnosi priorytet płatu w planowaniu ochrony i uzasadnia wybór stanowiska referencyjnego.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jak skutecznie, oraz propozycje. Typowe dla 2180: pozostawianie martwych i obumierających drzew, pozostawianie fragmentów drzewostanów do naturalnego rozwoju, rębnie złożone z odnowieniem naturalnym, wyłączanie płatów z gospodarki, kanalizowanie ruchu turystycznego, usuwanie obcych sosen i czeremchy amerykańskiej, stopniowe usuwanie sosny z górnego piętra w drzewostanach zastępczych (wspieranie dębu i brzozy), w skrajnie zdegradowanych płatach – wprowadzanie bażyny czarnej. Brak działań – „Brak”.

Dlaczego: w 2024 r. stwierdzono zmniejszanie intensywności użytkowania i wyłączanie płatów z gospodarki. Bez tej informacji nie da się odróżnić naturalnych zmian od skutków zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_2180.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2180(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2180(name)
    if (!e) return undefined
    const label = GROUP_LABELS_2180[e.group]
    if (!e.characteristic) return label
    const where = e.characteristic.map((v) => variantLabel(v)).join(' i ')
    return `${label}, charakterystyczny dla ${where}${e.core ? ' (gatunek kluczowy)' : ''}`
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2180 = (id: string): IndicatorDef => {
  const i = methodology2180.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
