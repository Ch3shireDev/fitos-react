// Metodyka 6410 jako dane, w tym samym układzie karty RDOŚ we Wrocławiu co 6510 (dokumentacja PZO).
// Źródła: Michalska-Hejduk D., Kopeć D. 2012. 6410 Zmiennowilgotne łąki trzęślicowe (Molinion). W: Mróz W. (red.)
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ: tab. 1 i 2, przykład karty Wędziszew;
// sprawozdania z monitoringu 6410 z lat 2009–2011, 2015–2018 i 2023–2025.
// W 6410 nie ma wskaźnika „Udział dobrze zachowanych płatów” (jest w 6510), a „Procent powierzchni zajęty przez
// siedlisko w transekcie” ma własne progi z przewodnika.
import { describeSpecies, num } from '../../7120/habitats/assessment'
import type { Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { methodology65XX } from '../../65XX/habitats/methodology'
import { RDOS_IMPACT_CODES, rdosExtraSteps, rdosOtherFields, rdosReleveFields, rdosSiteFields } from '../../rdos/fields'
import {
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
import { GROUP_LABELS_6410, SPECIES_6410, defaultLayer6410, findSpecies6410, isJuncoMolinietum, typical6410 } from './species'

const groupOf = (name: string) => findSpecies6410(name)?.group as string | undefined

/** Dominanty obniżające ocenę do U2: ekspansywne i ekologicznie obce. */
const BAD_DOMINANT = new Set(['expansive-strong', 'expansive', 'invasive-high', 'invasive-low', 'woody'])

const FRAGMENTATION_6410: SelectOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna (także mozaika warunków edaficznych)' },
  { value: 'medium', label: 'Średni stopień fragmentacji (płaty po kilkanaście arów)' },
  { value: 'large', label: 'Duży stopień fragmentacji (płaty po kilka arów)' },
]

const typical = (i: InputValues, ctx?: IndicatorContext) => typical6410(named(i), isJuncoMolinietum(ctx?.site))

const indicators: IndicatorDef[] = [
  areaIndicator('6410'),
  percentIndicator({
    help: `Co wpisać: jaki procent powierzchni transektu zajmuje siedlisko 6410, z dokładnością do 10% (np. 90).

Progi (przewodnik, tab. 2): 80% i więcej – FV, 50–80% – U1, do 50% włącznie – U2.

Dlaczego: łąki trzęślicowe często tworzą mozaikę z łąkami świeżymi, ziołoroślami i szuwarami; spadek udziału na transekcie to sygnał sukcesji albo przesuszenia.`,
  }),
  {
    id: 'typical',
    label: 'Gatunki typowe (charakterystyczne i wyróżniające dla zw. Molinion)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla zw. Molinion z przybliżonym procentem pokrycia transektu (z dokładnością do 10%) oraz lista gatunków wyróżniających związek.',
    help: `Co wpisać: gatunki typowe stwierdzone na transekcie, z pokryciem w %.

Charakterystyczne (zw. Molinion i 2 gatunki rzędu Molinietalia): bukwica zwyczajna, czarcikęs łąkowy, goryczka wąskolistna, goździk pyszny, komonica skrzydlastostrąkowa, koniopłoch łąkowy, kosaciec syberyjski, mieczyk dachówkowaty, nasięźrzał pospolity, okrzyn łąkowy, olszewnik kminkolistny, oman wierzbolistny, przytulia północna, trzęślica modra, turzyca filcowata, sierpik barwierski, krwiściąg lekarski.

Wyróżniające: biedrzeniec mniejszy, drżączka średnia, dziewięciornik błotny, goryczuszki gorzkawa i błotna, len przeczyszczający, pięciornik kurze ziele, turzyca żółta, wierzba rokita. W łące sitowo-trzęślicowej Junco-Molinietum (6410-2; wpisz to w „Zbiorowisku roślinnym”) także sity: ostrokwiatowy, skupiony, rozpierzchły.

Jak liczy formularz: co najmniej 5 charakterystycznych i 3 wyróżniające – FV; 3 lub więcej charakterystycznych (przewodnik: 3–5 i obecne wyróżniające) – U1; 2 lub mniej charakterystycznych – U2. Przypadek „dużo charakterystycznych, brak wyróżniających” tabela pomija – formularz daje U1.

Dlaczego: łąki trzęślicowe odznaczają się dużym bogactwem gatunkowym. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Liczne gatunki charakterystyczne (≥5) i wyróżniające (≥3) dla zw. Molinion',
      U1: 'Średnioliczne gatunki charakterystyczne (3–5) i obecne gatunki wyróżniające dla zw. Molinion',
      U2: 'Nieliczne gatunki charakterystyczne (≤2) i wyróżniające dla zw. Molinion',
    },
    inputs: [speciesInput('Gatunki typowe na transekcie', 'Gatunki charakterystyczne i wyróżniające (lista pod „?” przy nazwie wskaźnika), z pokryciem w % transektu.', true)],
    suggest: (i, ctx) => {
      if (!named(i).length) return null
      const { char, dist } = typical(i, ctx)
      if (char.length >= 5 && dist.length >= 3) return 'FV'
      return char.length >= 3 ? 'U1' : 'U2'
    },
    explain: (i, ctx) => {
      if (!named(i).length) return null
      const { char, dist, skipped } = typical(i, ctx)
      const extra = skipped.length ? ` Nie liczę: ${skipped.join(', ')} – wyróżniające tylko dla Junco-Molinietum (6410-2).` : ''
      return `Charakterystycznych: ${char.length} (${char.join(', ') || '—'}); wyróżniających: ${dist.length} (${dist.join(', ') || '—'}).${extra}`
    },
    describe: (i) => describeSpecies(named(i)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność i przybliżony procent pokrycia (z dokładnością do 10%) gatunków współpanujących i panujących (ilościowość 3 i więcej w skali Braun-Blanqueta).',
    help: `Co wpisać: gatunki współpanujące i panujące (ilościowość 3 i więcej w skali Braun-Blanqueta) z pokryciem w %.

Jak liczy formularz:
• żaden gatunek nie pokrywa ponad 50% – FV (współpanują gatunki łąkowe, w tym typowe);
• ponad 50% pokrywa gatunek łąkowy z klasy Molinio-Arrhenatheretea (także trzęślica!) – U1;
• ponad 50% pokrywa gatunek ekspansywny albo obcy ekologicznie (śmiałek, wiązówka, trzcinnik, krzewy) – U2.

Dlaczego: w typowych płatach nie ma wyraźnych dominantów. Gatunek przeważający (BB 4–5), nawet typowy, zwykle oznacza niską różnorodność i postępujące niekorzystne zmiany. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Brak gatunków o pokryciu powyżej 50%; współpanują gatunki łąkowe, charakterystyczne dla klasy Molinio-Arrhenatheretea, w tym przede wszystkim gatunki typowe dla siedliska',
      U1: 'Obecne gatunki dominujące (pokrycie powyżej 50%); dominują gatunki łąkowe, charakterystyczne dla klasy Molinio-Arrhenatheretea',
      U2: 'Wśród dominantów (pokrycie powyżej 50%) obecne gatunki ekspansywne lub ekologicznie obce dla siedliska',
    },
    inputs: [speciesInput('Gatunki dominujące', 'Dominanty z pokryciem w % transektu.', true)],
    suggest: (i) => {
      const rows = named(i)
      if (!rows.length) return null
      const over = rows.filter((r) => (num(r.cover) ?? 0) > 50)
      if (!over.length) return 'FV'
      return over.some((r) => BAD_DOMINANT.has(groupOf(r.name) ?? '')) ? 'U2' : 'U1'
    },
    explain: (i) => {
      const rows = named(i)
      if (!rows.length) return null
      const over = rows.filter((r) => (num(r.cover) ?? 0) > 50)
      if (!over.length) return 'Żaden gatunek nie pokrywa ponad 50% transektu.'
      return `Ponad 50% pokrywa: ${over.map((r) => `${r.name} (${GROUP_LABELS_6410[groupOf(r.name) ?? 'other'] ?? 'inny'})`).join(', ')}.`
    },
    describe: (i) => describeSpecies(named(i)),
  },
  {
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista gatunków obcych geograficznie uznanych w Polsce za inwazyjne, z szacunkowym procentem pokrycia transektu.',
    help: `Co wpisać: gatunki obce inwazyjne na transekcie, z pokryciem. Brak – zostaw listę pustą. W łąkach trzęślicowych notowano: nawłoć kanadyjską, czeremchę amerykańską, uczep amerykański, przymiotno kanadyjskie, sporadycznie przestęp biały i wierzbownicę gruczołowatą.

Progi: brak – FV; pojedyncze osobniki albo pokrycie poniżej 5% – U1; ponad 5% – U2. Już pojedyncze osobniki (BB „+”) obniżają ocenę.`,
    thresholds: {
      FV: 'Brak gatunków inwazyjnych',
      U1: 'Pojedyncze osobniki lub pokrycie <5% transektu',
      U2: 'Pokrycie osobników gatunków inwazyjnych >5% transektu',
    },
    inputs: [speciesInput('Obce gatunki inwazyjne', 'Gatunki obce z pokryciem w % transektu. Brak – zostaw pustą listę.')],
    suggest: (i) => {
      const { count, total } = listCover(i)
      if (!count) return 'FV'
      if (total === undefined) return null
      return total > 5 ? 'U2' : 'U1'
    },
    describe: (i) => describeSpecies(named(i)) || 'Brak',
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description: 'Lista gatunków roślin zielnych rozprzestrzeniających się w siedlisku i mogących stanowić dla niego zagrożenie, z procentem pokrycia transektu.',
    help: `Co wpisać: rodzime gatunki zielne rozprzestrzeniające się na łące, z pokryciem. Szczególnie: śmiałek darniowy, perz, trzcinniki piaskowy i lancetowaty, wiązówka błotna, malina, pokrzywa, ostrożeń polny.

Jak liczy formularz: najliczniejszy gatunek ekspansywny poniżej 5% (BB poniżej 2) i łącznie poniżej 10% – FV; żaden gatunek ekspansywny nie przekracza 30% – U1; któryś pokrywa ponad 30% – U2. Próg 30% formularz stosuje do pojedynczego gatunku (w przykładzie Wędziszew śmiałek 30% i tojeść 10% oceniono na U1); przewodnik każe obniżać ocenę, gdy którykolwiek gatunek ma ilościowość ≥2 w skali Braun-Blanqueta.`,
    thresholds: {
      FV: 'Brak lub gatunki ekspansywne o niewielkim pokryciu (<10%)',
      U1: 'Gatunki ekspansywne o pokryciu do 30%',
      U2: 'Gatunki ekspansywne liczne o znacznym pokryciu',
    },
    inputs: [speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.')],
    suggest: (i) => {
      const { count, total, max } = listCover(i)
      if (!count) return 'FV'
      if (total === undefined || max === undefined) return null
      if (max < 5 && total < 10) return 'FV'
      return max <= 30 ? 'U1' : 'U2'
    },
    explain: (i) => {
      const { count, total, max } = listCover(i)
      if (!count) return null
      return `Łączne pokrycie ${fmtPct(total)}, najliczniejszy gatunek ${fmtPct(max)}.`
    },
    describe: (i) => describeSpecies(named(i)) || 'Brak',
  },
  shrubsIndicator({
    thresholds: { FV: 'Łączne pokrycie w transekcie <5%', U1: 'Łączne pokrycie w transekcie 5–20%', U2: 'Łączne pokrycie w transekcie >20%' },
    grade: (t): Grade => (t < 5 ? 'FV' : t <= 20 ? 'U1' : 'U2'),
    help: `Co wpisać: krzewy i drzewa (także podrost) w transekcie z pokryciem w %, najlepiej z podziałem na warstwy (w polu wartości). Najczęściej: wierzby, brzoza brodawkowata, jałowiec, sosna, osika. Gdy znasz łączne pokrycie, wpisz je w polu poniżej – ma pierwszeństwo przed sumą listy.

Progi: poniżej 5% – FV, 5–20% – U1, ponad 20% – U2.

Dlaczego: to czuły wskaźnik braku użytkowania; skład gatunkowy drzew i krzewów pokazuje kierunek sukcesji. Wskaźnik kardynalny.`,
  }),
  litterIndicator({
    help: `Jak mierzyć: w 20 miejscach w transekcie natnij darń nożem i zmierz linijką grubość nierozłożonej materii organicznej ponad poziomem próchnicznym. Wpisz minimum, maksimum i średnią.

Progi (średnia): poniżej 2 cm – FV, 2–5 cm – U1, ponad 5 cm – U2.

Dlaczego: wskaźnik informuje, czy łąka jest regularnie koszona.`,
  }),
  spatialIndicator({
    fragmentation: FRAGMENTATION_6410,
    thresholds: {
      FV: 'Brak fragmentacji lub fragmentacja nieznaczna; wyjątek stanowi sytuacja, gdy łąki trzęślicowe w obrębie transektu zajmują niewielką powierzchnię i ich fragmentacja wynika z mozaikowości warunków edaficznych',
      U1: 'Średni stopień fragmentacji (płaty po kilkanaście arów)',
      U2: 'Duży stopień fragmentacji (płaty po kilka arów)',
    },
    help: `Co wybrać: stopień fragmentacji siedliska (duży, średni, mały) i – w opisie – wielkość poszczególnych płatów w transekcie oraz przyczynę fragmentacji.

Pułapka: tylko fragmentację wynikającą z ukształtowania terenu (np. łąki na niewielkich mineralnych wyniesieniach – grądzikach) uznaje się za właściwą. Fragmentacja z powodu zmiany użytkowania, przesuszenia czy zabagnienia obniża ocenę.`,
  }),
]

export const methodology6410: Methodology = {
  code: '6410',
  name: 'Zmiennowilgotne łąki trzęślicowe (Molinion)',
  source:
    'Michalska-Hejduk D., Kopeć D. 2012, w: Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III (GIOŚ), tab. 1 i 2; sprawozdania z monitoringu 6410 2009–2011, 2015–2018, 2023–2025; układ karty RDOŚ we Wrocławiu (jak PLH020050_6510_*.xlsx)',

  siteFields: rdosSiteFields({
    code: '6410',
    communityPlaceholder: 'np. Selino-Molinietum',
    communityHelp: `Zbiorowisko roślinne reprezentujące siedlisko, z podtypem:
• 6410-1 Selino carvifoliae-Molinietum – łąka olszewnikowo-trzęślicowa;
• 6410-2 Junco acutiflori-Molinietum – łąka sitowo-trzęślicowa (uboga, na glebach kwaśnych);
• 6410-3 Galio veri-Molinietum – łąka przytuliowo-trzęślicowa (suchsza, z gatunkami ciepłolubnymi);
• 6410-4 Ranunculo polyanthemi-Filipenduletum vulgaris.

Uwaga: gdy wpiszesz Junco-Molinietum (albo „6410-2”), formularz policzy sity ostrokwiatowy, skupiony i rozpierzchły jako gatunki wyróżniające.`,
    dateHint: 'Optymalnie przed pierwszym pokosem: koniec czerwca – pierwsza połowa lipca (w górach połowa lipca).',
    dateWarn: dateWindowWarn(
      [6, 15],
      [9, 15],
      'Termin poza oknem połowa czerwca – połowa września. Optimum to okres po wykłoszeniu traw, w czasie kwitnienia turzyc, przed pierwszym pokosem (albo między pokosami).',
    ),
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Trzy zdjęcia fitosocjologiczne metodą Braun-Blanqueta na poletkach 5×5 m, co 100 m wzdłuż transektu. Gdy siedlisko jest rozmieszczone nieciągle, lokalizację zdjęć można wybrać arbitralnie – podaj wtedy współrzędne środka każdego zdjęcia.',
    fields: rdosReleveFields(methodology65XX.releves.fields).map((f) =>
      f.name === 'coverC'
        ? { ...f, help: 'Warstwa C – zielna. Na łące trzęślicowej zwykle 90–100%.\n\nDlaczego: zwarcie runi pokazuje, czy łąka jest koszona.' }
        : f.name === 'unit'
          ? { ...f, help: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Selino-Molinietum”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowiska stanowiska.' }
          : f,
    ),
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca obecny stan zachowania i czynniki, które mogą na nie oddziaływać w najbliższej przyszłości, zwłaszcza możliwość ekstensywnego użytkowania kośnego.',
    help: `Co wpisać: krótką prognozę stanu siedliska w perspektywie 10–20 lat: obecny stan, trendy, użytkowanie (koszenie raz w roku lub raz na dwa lata, późnym latem, nie niżej niż 10 cm, z usunięciem biomasy), ochrona czynna i jej plany.

Dlaczego: największym zagrożeniem jest odejście od tradycyjnej ekstensywnej gospodarki – zarastanie albo dominacja gatunków ekspansywnych.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: RDOS_IMPACT_CODES,
  otherFields: rdosOtherFields(),
  extraSteps: rdosExtraSteps(indicators),

  speciesCatalog: SPECIES_6410.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6410(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6410(name)
    return e ? GROUP_LABELS_6410[e.group] : undefined
  },
}

/** Nazwa siedliska w arkuszu RDOŚ (brzmienie z rozporządzenia). */
export const rdosProfile6410 = {
  habitatName: 'Zmiennowilgotne łąki trzęślicowe (Molinion)',
  rowLabels: { litter: 'Martwa materia organiczna (wojłok)', typical: 'Gatunki typowe' },
}
