// Metodyka 6510 jako dane, w układzie karty RDOŚ we Wrocławiu (dokumentacja PZO, wzór PLH020050_6510_*.xlsx).
// Źródła: Korzeniak J. 2012. 6510 Ekstensywnie użytkowane niżowe łąki świeże (Arrhenatherion). W: Mróz W. (red.)
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ: tab. 1 i 2, przykład karty Kowaliki 1;
// sprawozdania z monitoringu 6510 z lat 2009–2011, 2015–2018 i 2023–2025.
// Odstępstwa od przewodnika (za wzorem RDOŚ): wskaźnik „Procent powierzchni zajęty przez siedlisko na transekcie”
// (w przewodniku 6510 bez waloryzacji – progi wzięte z 6410), kolejność wskaźników jak w arkuszu „ocena”,
// ocena referencyjna i działania ochronne w osobnych zakładkach.
import { describeSpecies, num } from '../../7120/habitats/assessment'
import type { Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { methodology65XX } from '../../65XX/habitats/methodology'
import { RDOS_IMPACT_CODES, rdosExtraSteps, rdosOtherFields, rdosReleveFields, rdosSiteFields } from '../../rdos/fields'
import {
  FRAGMENTATION_BASIC,
  areaIndicator,
  dateWindowWarn,
  fmtPct,
  listCover,
  litterIndicator,
  named,
  percentIndicator,
  shrubsIndicator,
  spatialIndicator,
  speciesInput,
} from '../../rdos/meadow'
import { GROUP_LABELS_6510, SPECIES_6510, characteristic6510, defaultLayer, findSpecies6510, isPoaFestuca, type LocalVariant } from './species'

const groupOf = (name: string) => findSpecies6510(name)?.group

/** Dominanty obniżające ocenę do U2: ekspansywne i ekologicznie obce. */
const BAD_DOMINANT = new Set(['expansive-strong', 'expansive', 'invasive-high', 'invasive-low', 'woody'])

const LOCAL_VARIANTS: SelectOption[] = [
  { value: '', label: 'Brak (tylko lista z przewodnika)' },
  { value: 'sudety', label: 'Sudety i Przedgórze Sudeckie – liczy się kostrzewa czerwona' },
  { value: 'lubuska', label: 'Ziemia Lubuska – liczy się przytulia biała' },
]

const variantOf = (ctx?: IndicatorContext): LocalVariant => String(ctx?.site?.localVariant ?? '') as LocalVariant

function characteristic(i: InputValues, ctx?: IndicatorContext) {
  return characteristic6510(named(i), { poaFestuca: isPoaFestuca(ctx?.site), variant: variantOf(ctx) })
}

function invasiveSplit(i: InputValues) {
  const rows = named(i)
  const high = rows.filter((r) => groupOf(r.name) === 'invasive-high')
  const low = rows.filter((r) => groupOf(r.name) !== 'invasive-high')
  const sum = (rs: SpeciesRow[]) => listCover({ species: rs }).total
  return { rows, high, low, highTotal: sum(high), lowTotal: sum(low) }
}

/** Pojedyncze osobniki = pokrycie „<1%” (0,5) lub mniej. */
const SINGLE = 0.5

const indicators: IndicatorDef[] = [
  areaIndicator('6510'),
  percentIndicator({
    help: `Co wpisać: jaki procent powierzchni transektu zajmuje siedlisko 6510 (szacunek w dziesiątkach procent), np. 100% albo 90%. Wskaźnik jest w arkuszu RDOŚ i w przykładzie karty z przewodnika (Kowaliki 1, 100% – FV), ale przewodnik 6510 nie podaje dla niego progów – formularz bierze progi z metodyki 6410: co najmniej 80% – FV, 50–80% – U1, do 50% – U2. Sprawozdanie 2023–2025 też zwraca uwagę, że wskaźnik nie ma waloryzacji.

Dlaczego: niski udział siedliska na transekcie oznacza, że transekt obejmuje inne zbiorowiska albo że łąka zanika.`,
  }),
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla zw. Arrhenatherion i zespołu Arrhenatheretum elatioris z przybliżonym procentem pokrycia transektu.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %. Lista z przewodnika: rajgras wyniosły Arrhenatherum elatius, bodziszek łąkowy Geranium pratense, szczaw rozpierzchły Rumex thyrsiflorus, dzwonek rozpierzchły Campanula patula, pępawa dwuletnia Crepis biennis, przytulia pospolita Galium mollugo, świerzbnica polna Knautia arvensis, pasternak zwyczajny Pastinaca sativa, kozibród wschodni Tragopogon orientalis, kozibród łąkowy T. pratensis.

Lokalnie charakterystyczne (ustaw „Wariant regionalny” w części ogólnej): przytulia biała Galium album na Ziemi Lubuskiej, kostrzewa czerwona Festuca rubra w Sudetach i na Przedgórzu. Gdy zbiorowisko to Poa pratensis-Festuca rubra, za diagnostyczne liczą się też wiechlina łąkowa i kostrzewa czerwona.

Progi: Arrhenatheretum elatioris – więcej niż 4 gatunki FV, 3–4 U1, 2 lub mniej U2; zb. Poa pratensis-Festuca rubra – 3–4 gatunki FV, 2 U1, mniej – U2 (tabela przewodnika przy U2 podaje „2 lub mniej” dla obu, formularz przyjmuje 2 jako U1 dla Poa-Festuca, bo tak mówi kolumna U1). Formularz tylko podpowiada – w kartach RDOŚ eksperci oceniali ten wskaźnik także całościowo („dominacja gatunków typowych”).

Dlaczego: gatunki charakterystyczne mówią, czy skład fitocenozy jest typowy dla siedliska. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'W przypadku Arrhenatheretum elatioris więcej niż 4 gatunki charakterystyczne dla siedliska; dla zb. Poa pratensis-Festuca rubra 3–4 gatunki',
      U1: 'W przypadku Arrhenatheretum elatioris 3–4 gatunki charakterystyczne dla siedliska, dla zb. Poa pratensis-Festuca rubra 2 gatunki',
      U2: 'Gatunków charakterystycznych dla siedliska 2 lub mniej',
    },
    inputs: [speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki z listy (jest pod „?” przy nazwie wskaźnika), z pokryciem w % transektu.', true)],
    suggest: (i, ctx) => {
      if (!named(i).length) return null
      const n = characteristic(i, ctx).counted.length
      if (isPoaFestuca(ctx?.site)) return n >= 3 ? 'FV' : n === 2 ? 'U1' : 'U2'
      return n > 4 ? 'FV' : n >= 3 ? 'U1' : 'U2'
    },
    explain: (i, ctx) => {
      if (!named(i).length) return null
      const { counted, skipped } = characteristic(i, ctx)
      const extra = skipped.length
        ? ` Nie liczę: ${skipped.join(', ')} – liczą się tylko w zb. Poa pratensis-Festuca rubra albo w wariancie regionalnym (część ogólna).`
        : ''
      return `Gatunków charakterystycznych: ${counted.length} (${counted.join(', ') || '—'}).${extra}`
    },
    describe: (i) => describeSpecies(named(i)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description: 'Lista kilku gatunków, które osiągają największe pokrycie na transekcie, z przybliżonym procentem pokrycia.',
    help: `Co wpisać: kilka gatunków o największym pokryciu na transekcie, z pokryciem w %. Wzór RDOŚ każe też napisać wprost, czy dominują gatunki typowe dla siedliska – zrób to w polu wartości (np. „Dominują gatunki typowe dla siedliska: Alopecurus pratensis 30%…”).

Jak liczy formularz:
• wśród dominantów jest gatunek ekspansywny albo obcy ekologicznie (trzcinnik, wrotycz, nawłoć, krzewy) – U2;
• któryś gatunek inny niż charakterystyczny pokrywa ponad 50% transektu (silna dominacja np. wyczyńca albo kupkówki) – U1;
• w przeciwnym razie (brak gatunków panujących albo dominują charakterystyczne) – FV.

Dlaczego: silna dominacja jednego gatunku zubaża łąkę, a dominanty ekspansywne zapowiadają jej zanik.`,
    thresholds: {
      FV: 'Brak gatunków panujących lub status dominanta osiągają gatunki charakterystyczne dla siedliska',
      U1: 'Silna dominacja (>50%) gatunków typowych dla łąk świeżych',
      U2: 'Wśród dominantów obecne gatunki ekspansywne lub ekologicznie obce dla siedliska',
    },
    inputs: [speciesInput('Gatunki dominujące', 'Dominanty z pokryciem w % transektu.', true)],
    suggest: (i, ctx) => {
      const rows = named(i)
      if (!rows.length) return null
      if (rows.some((r) => BAD_DOMINANT.has(groupOf(r.name) ?? ''))) return 'U2'
      const chars = new Set(characteristic({ species: rows }, ctx).counted)
      return rows.some((r) => (num(r.cover) ?? 0) > 50 && !chars.has(r.name.trim())) ? 'U1' : 'FV'
    },
    explain: (i) => {
      const rows = named(i)
      if (!rows.length) return null
      const bad = rows.filter((r) => BAD_DOMINANT.has(groupOf(r.name) ?? ''))
      if (bad.length) return `Wśród dominantów: ${bad.map((r) => `${r.name} (${GROUP_LABELS_6510[groupOf(r.name) ?? 'other']})`).join(', ')}.`
      const over = rows.filter((r) => (num(r.cover) ?? 0) > 50)
      return over.length ? `Ponad 50% pokrywa: ${describeSpecies(over)}.` : 'Żaden gatunek nie pokrywa ponad 50% transektu.'
    },
    describe: (i) => describeSpecies(named(i)),
  },
  {
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista gatunków obcych geograficznie i ekologicznie dla siedliska z szacunkowym procentem pokrycia transektu.',
    help: `Co wpisać: każdy gatunek obcy na transekcie, z pokryciem (w wartości – także stopień inwazyjności, jak chce wzór RDOŚ). Brak – zostaw listę pustą.

Wysoce inwazyjne (przewodnik, tab. 1, i sprawozdania): rdestowce, nawłoć kanadyjska i późna, barszcze Sosnowskiego i Mantegazziego, czeremcha amerykańska, słonecznik bulwiasty, przymiotno białe, łubin trwały, szczaw omszony, klon jesionolistny – dla nich na obniżenie oceny wpływa już sama obecność. Gatunek spoza katalogu liczy się jako słabo inwazyjny.

Jak liczy: brak albo pojedyncze osobniki (pokrycie „<1%”) gatunków słabo inwazyjnych – FV; słabo inwazyjne poniżej 5% albo pojedyncze osobniki wysoce inwazyjnych – U1; wysoce inwazyjne z większym pokryciem albo słabo inwazyjne na ponad 5% transektu – U2. Tak oceniano w kartach RDOŚ: Solidago canadensis <1% – U1.`,
    thresholds: {
      FV: 'Brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności, tj. nie zagrażające różnorodności biologicznej',
      U1: 'Gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków wysoce inwazyjnych',
      U2: 'Obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności',
    },
    inputs: [speciesInput('Obce gatunki inwazyjne', 'Gatunki obce z pokryciem w % transektu. Brak – zostaw pustą listę.')],
    suggest: (i) => {
      const s = invasiveSplit(i)
      if (!s.rows.length) return 'FV'
      if (s.highTotal === undefined || s.lowTotal === undefined) return null
      if (s.highTotal > SINGLE * s.high.length || s.lowTotal > 5) return 'U2'
      if (s.high.length || s.lowTotal > SINGLE) return 'U1'
      return 'FV'
    },
    explain: (i) => {
      const s = invasiveSplit(i)
      if (!s.rows.length) return null
      const part = (label: string, rs: SpeciesRow[], t?: number) => (rs.length ? `${label}: ${rs.map((r) => r.name).join(', ')} (razem ${fmtPct(t)})` : '')
      return [part('Wysoce inwazyjne', s.high, s.highTotal), part('Słabo inwazyjne lub spoza katalogu', s.low, s.lowTotal)]
        .filter(Boolean)
        .join('. ')
        .concat('. Pojedyncze osobniki = pokrycie do 0,5% na gatunek – to interpretacja.')
    },
    describe: (i) => describeSpecies(named(i)) || 'Brak',
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description: 'Lista gatunków roślin zielnych rozprzestrzeniających się w siedlisku i mogących stanowić dla niego zagrożenie, z procentem pokrycia transektu.',
    help: `Co wpisać: rodzime gatunki zielne rozprzestrzeniające się na łące, z pokryciem; w wartości zaznacz, czy są silnie ekspansywne. Brak – zostaw listę pustą.

Przewodnik wymienia: ekspansywne trawy (trzcinnik piaskowy, śmiałek darniowy, perz, trzcina), gatunki nitrofilne (pokrzywa, ostrożeń polny, świerząbek korzenny, podagrycznik, trybula leśna, przytulia czepna), nitrofilne ruderalne (wrotycz, bylica) i inne (jeżyny, orlica) – świadczą o braku koszenia. Formularz traktuje je jako silnie ekspansywne.

Jak liczy: brak silnie ekspansywnych i łącznie <20% – FV; żaden silnie ekspansywny nie przekracza 10% i łącznie <50% – U1; łącznie >50% albo silnie ekspansywny powyżej 10% – U2 (to drugie to interpretacja: nie spełnia warunku U1). W karcie RDOŚ PLH020050_6510_06 trzcinnik 20% i wrotycz 15% oceniono na U2.

Dlaczego: wskaźnik pokazuje zaniechanie albo niewłaściwe użytkowanie łąki. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Brak gatunków silnie ekspansywnych i łączne pokrycie gatunków ekspansywnych <20%',
      U1: 'Pokrycie żadnego z gatunków silnie ekspansywnych nie przekracza 10% i łączne pokrycie gatunków ekspansywnych <50%',
      U2: 'Łączne pokrycie gatunków ekspansywnych >50%',
    },
    inputs: [speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.')],
    suggest: (i) => {
      const rows = named(i)
      if (!rows.length) return 'FV'
      const { total } = listCover(i)
      const strong = rows.filter((r) => groupOf(r.name) === 'expansive-strong')
      const maxStrong = strong.length ? Math.max(...strong.map((r) => num(r.cover) ?? Number.NaN)) : 0
      if (total === undefined || Number.isNaN(maxStrong)) return null
      if (total > 50) return 'U2'
      if (!strong.length && total < 20) return 'FV'
      return maxStrong <= 10 ? 'U1' : 'U2'
    },
    explain: (i) => {
      const rows = named(i)
      if (!rows.length) return null
      const strong = rows.filter((r) => groupOf(r.name) === 'expansive-strong')
      return `Łączne pokrycie gatunków ekspansywnych ${fmtPct(listCover(i).total)}; ${strong.length ? `silnie ekspansywne: ${describeSpecies(strong)}` : 'brak gatunków silnie ekspansywnych'}.`
    },
    describe: (i) => describeSpecies(named(i)) || 'Brak',
  },
  shrubsIndicator({
    thresholds: { FV: 'Łączne pokrycie na transekcie <1%', U1: 'Łączne pokrycie na transekcie 1–5%', U2: 'Łączne pokrycie na transekcie >5%' },
    grade: (t): Grade => (t < 1 ? 'FV' : t <= 5 ? 'U1' : 'U2'),
    help: `Co wpisać: krzewy i drzewa (także podrost) na transekcie z pokryciem w %. Szczególną wagę mają gatunki pionierskie i dające odrosty korzeniowe (głogi, dereń, róże, tarnina). Gdy znasz łączne pokrycie (rzut koron), wpisz je w polu poniżej – ma pierwszeństwo przed sumą listy.

Progi: poniżej 1% – FV, 1–5% – U1, ponad 5% – U2.

Dlaczego: młode krzewy i drzewa na łące to oznaka długotrwałego braku koszenia. Wskaźnik kardynalny.`,
  }),
  {
    id: 'wellPreserved',
    label: 'Udział dobrze zachowanych płatów siedliska',
    parameter: 'structure',
    description:
      'Szacowany w skali transektu procentowy udział dobrze wykształconych płatów w stosunku do przejściowych, nietypowych, zdegenerowanych, z gatunkami ekspansywnymi.',
    help: `Co wpisać: jaki procent powierzchni transektu zajmują płaty typowo wykształcone – z gatunkami charakterystycznymi i wyróżniającymi dla zespołu i związku, bogate gatunkowo.

Progi: co najmniej 80% – FV, 50–79% – U1, poniżej 50% – U2. U1/U2 daje też sytuacja, gdy płaty są generalnie mało typowe (U1) albo źle zachowane i ubogie w gatunki (U2) – wtedy popraw podpowiedź.

Dlaczego: wskaźnik mówi, jaka część siedliska ma właściwą strukturę gatunkową. W cyklu 2023–2025 był oceniany najgorzej ze wszystkich.`,
    thresholds: {
      FV: 'Płaty dobrze zachowane stanowią nie mniej niż 80% powierzchni transektu',
      U1: 'Płaty dobrze zachowane stanowią 50–79% powierzchni transektu lub generalnie płaty na transekcie mało typowe, średnio bogate w gatunki',
      U2: 'Płaty dobrze zachowane stanowią mniej niż 50% powierzchni transektu lub generalnie płaty na transekcie źle zachowane, ubogie w gatunki',
    },
    inputs: [
      {
        kind: 'number',
        name: 'share',
        label: 'Udział dobrze zachowanych płatów',
        unit: '%',
        min: 0,
        max: 100,
        required: true,
        help: 'Procent powierzchni transektu zajęty przez typowo wykształcone płaty, w dziesiątkach procent (np. 80, 40).',
      },
    ],
    suggest: (i) => {
      const v = num(i.share)
      if (v === undefined) return null
      return v >= 80 ? 'FV' : v >= 50 ? 'U1' : 'U2'
    },
    describe: (i) => (num(i.share) === undefined ? '' : fmtPct(num(i.share))),
  },
  litterIndicator({
    help: `Jak mierzyć: w 20 miejscach w płacie natnij darń nożem i zmierz linijką grubość nierozłożonej materii organicznej ponad poziomem próchnicznym. Wpisz minimum, maksimum i średnią. We wzorze RDOŚ wartość podaje się w cm (np. „<2 cm”, „2–5 cm”).

Progi: poniżej 2 cm – FV, 2–5 cm – U1, ponad 5 cm – U2.

Dlaczego: wojłok odkłada się, gdy łąka nie jest koszona albo biomasa nie jest zbierana.`,
  }),
  spatialIndicator({
    fragmentation: FRAGMENTATION_BASIC,
    thresholds: {
      FV: 'Brak fragmentacji lub fragmentacja nieznaczna',
      U1: 'Średni stopień fragmentacji',
      U2: 'Duży stopień fragmentacji (płaty po kilka arów)',
    },
    help: `Co wybrać: jak bardzo siedlisko jest pocięte na osobne płaty na stanowisku.

Pułapka: jeśli fragmentacja wynika z czynników naturalnych (stabilna mozaika siedlisk uwarunkowana podłożem, mikrorzeźbą), a nie jest objawem degeneracji (osuszenie, zabagnienie, zakrzewienie po zaniechaniu koszenia), zaznacz to w opisie wskaźnika.`,
  }),
]

export const methodology6510: Methodology = {
  code: '6510',
  name: 'Ekstensywnie użytkowane niżowe łąki świeże (Arrhenatherion)',
  source:
    'Korzeniak J. 2012, w: Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III (GIOŚ), tab. 1 i 2; sprawozdania z monitoringu 6510 2009–2011, 2015–2018, 2023–2025; układ karty RDOŚ we Wrocławiu (PLH020050_6510_*.xlsx)',

  siteFields: rdosSiteFields({
    code: '6510',
    communityPlaceholder: 'np. Arrhenatheretum elatioris',
    communityHelp: `Zbiorowisko roślinne reprezentujące siedlisko na stanowisku:
• Arrhenatheretum elatioris – łąka rajgrasowa (bujna, wielowarstwowa ruń);
• Poa pratensis-Festuca rubra – zbiorowisko wiechliny łąkowej i kostrzewy czerwonej (ruń niższa, uboższa).

Uwaga: gdy wpiszesz Poa pratensis-Festuca rubra, formularz policzy wiechlinę łąkową i kostrzewę czerwoną jako gatunki diagnostyczne i zastosuje progi gatunków charakterystycznych dla tego zbiorowiska.`,
    dateHint: 'Optymalnie po wykłoszeniu traw, przed pierwszym pokosem (zwykle koniec maja – przełom czerwca i lipca).',
    dateWarn: dateWindowWarn(
      [5, 1],
      [7, 31],
      'Termin poza oknem maj–lipiec. Optimum to okres po wykłoszeniu traw, a przed pierwszym pokosem; po pokosie skład i pokrycie są niepełne.',
    ),
    extra: [
      {
        kind: 'select',
        name: 'localVariant',
        label: 'Wariant regionalny gatunków charakterystycznych',
        options: LOCAL_VARIANTS,
        help: 'Przewodnik pozwala uznać za lokalnie charakterystyczne: przytulię białą Galium album na Ziemi Lubuskiej i kostrzewę czerwoną Festuca rubra na łąkach sudeckich (Sudety i Przedgórze Sudeckie). Wybór zmienia tylko podpowiedź oceny „Gatunków charakterystycznych”; do arkusza nie trafia.',
      },
    ],
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne metodą Braun-Blanqueta, co 100 m wzdłuż transektu (na początku, w środku i na końcu), każde na poletku 5×5 m. W arkuszu RDOŚ gatunki trafiają do wierszy według warstwy i ilościowości.',
    fields: rdosReleveFields(methodology65XX.releves.fields).map((f) =>
      f.name === 'coverC'
        ? { ...f, help: 'Warstwa C – zielna. Na dobrze zachowanej łące świeżej zwykle 90–100%.\n\nDlaczego: bujna, wielowarstwowa ruń to cecha łąki rajgrasowej.' }
        : f.name === 'coverD'
          ? { ...f, help: 'Warstwa D – mszysta. Na łąkach świeżych zwykle słabo rozwinięta (kilka procent).\n\nDlaczego: rozrastające się mchy przy zbitej darni bywają objawem braku koszenia lub nawożenia.' }
          : f.name === 'unit'
            ? { ...f, help: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Arrhenatheretum elatioris” albo „Poa pratensis-Festuca rubra”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowiska stanowiska.' }
            : f,
    ),
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca obecny stan zachowania i czynniki, które mogą na nie oddziaływać w najbliższej przyszłości, zwłaszcza możliwość ekstensywnego użytkowania kośnego lub kośno-pasterskiego.',
    help: `Co wpisać: krótką prognozę stanu siedliska na stanowisku w perspektywie 10–20 lat (tak chce wzór RDOŚ): obecny stan, obserwowane trendy, użytkowanie (koszenie, programy rolnośrodowiskowe, np. „łąka użytkowana w ramach Wariantu 4.7 PRŚK”), plany i działania, które mogą wpłynąć na siedlisko.

Dlaczego: łąka świeża istnieje tylko dzięki ekstensywnemu koszeniu. Zarzucenie koszenia i intensyfikacja (nawożenie, częste pokosy) to dwa główne zagrożenia.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: RDOS_IMPACT_CODES,
  otherFields: rdosOtherFields(),
  extraSteps: rdosExtraSteps(indicators),

  speciesCatalog: SPECIES_6510.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6510(name)
    return e ? GROUP_LABELS_6510[e.group] : undefined
  },
}

/** Etykiety i nazwa siedliska w arkuszu RDOŚ (brzmienie z wzoru). */
export const rdosProfile6510 = {
  habitatName: 'Niżowe i górskie świeże łąki użytkowane ekstensywnie (Arrhenatherion elatioris)',
  rowLabels: { litter: 'Martwa materia organiczna (wojłok)' },
}

