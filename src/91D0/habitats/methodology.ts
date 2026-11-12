// Metodyka *91D0 jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny”
// (GIOŚ, Biblioteka Monitoringu Środowiska), rozdział 91D0 Bory i lasy bagienne, tab. 1 i 2.
// Wspólne typy, logika ocen i komponenty formularza leżą w src/7120, helpery leśne w src/forest – tu są wyłącznie dane 91D0.
// Pola `help` to rozszerzone wyjaśnienia „co wpisać i dlaczego”.
import { isIsoDate } from '../../7120/habitats/dates'
import type { FieldDef, IndicatorContext, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import {
  AREA_TREND_OPTIONS,
  DEAD_WOOD_COUNT_OPTIONS,
  DISTORTION_OPTIONS,
  DOMINANCE_OPTIONS,
  KEY_SPECIES_OPTIONS,
  LOGGING_OPTIONS,
  REGENERATION_OPTIONS,
  STAND_AGE_OPTIONS,
  VERTICAL_OPTIONS,
  byOption,
  fmt,
  labelOf,
  listCover,
  pct,
  selectInput,
  speciesInput,
} from '../../forest'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  GROUP_LABELS_91D0,
  SPECIES_91D0,
  VARIANTS_91D0,
  characteristicMatch,
  defaultLayer91D0,
  findSpecies91D0,
  rowsOfGroups,
  variantOf,
  type Variant91D0,
} from './species'

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} osi transektu, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E. Jeśli punkt ma oznaczenie w bazie (np. r32), dopisz je.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu za 3–6 lat. W tych samych trzech punktach (początek, środek, koniec) wykonuje się zdjęcia fitosocjologiczne 10×10 m.`

const pick7120 = (name: string): FieldDef => {
  const f = methodology7120.siteFields.find((x) => x.name === name)
  if (!f) throw new Error(`Brak pola ${name} w metodyce 7120`)
  return f
}

// ---------- wariant siedliska ----------

export const VARIANT_OPTIONS: SelectOption[] = (Object.keys(VARIANTS_91D0) as Variant91D0[]).map((v) => ({
  value: v,
  label: VARIANTS_91D0[v].label,
}))

const variantName = (ctx?: IndicatorContext) => {
  const v = variantOf(ctx?.site)
  return v ? VARIANTS_91D0[v].label : undefined
}

// ---------- opcje selektów ----------

const AREA_TREND = AREA_TREND_OPTIONS

const DOMINANCE = DOMINANCE_OPTIONS

const HYDRATION: SelectOption[] = [
  { value: 'proper', label: 'Właściwe, bagienne uwodnienie' },
  { value: 'slight', label: 'Nieco przesuszone' },
  { value: 'strong', label: 'Silnie przesuszone' },
]

const AGE = STAND_AGE_OPTIONS

const REGENERATING: SelectOption[] = [
  { value: 'no', label: 'Nie odnawiają się' },
  { value: 'yes', label: 'Odnawiają się (siewki, podrost)' },
]

const DEAD_WOOD = DEAD_WOOD_COUNT_OPTIONS

const REGENERATION = REGENERATION_OPTIONS

const SPHAGNUM: SelectOption[] = [
  { value: 'dominant', label: 'Dominują w runie, normalne zróżnicowanie gatunkowe' },
  { value: 'reduced', label: 'Obniżone pokrycie albo różnorodność gatunkowa' },
  { value: 'none', label: 'Brak lub bardzo niskie pokrycie' },
]

const DWARF: SelectOption[] = [
  { value: 'normal', label: 'Występują z normalną obfitością (z uwzględnieniem lokalnej specyfiki)' },
  { value: 'sparse', label: 'Występują skąpo' },
  { value: 'none', label: 'Zupełnie brak' },
]

const VERTICAL = VERTICAL_OPTIONS

const LOGGING = LOGGING_OPTIONS

const DISTORTIONS = DISTORTION_OPTIONS

const KEY_SPECIES = KEY_SPECIES_OPTIONS

const isPineBog = (ctx?: IndicatorContext) => variantOf(ctx?.site) === 'pineBog'
const noDwarfShrubs = (ctx?: IndicatorContext) => {
  const v = variantOf(ctx?.site)
  return v === 'spruceBog' || v === 'pineBirchBoreal'
}

export const methodology91D0: Methodology = {
  code: '91D0',
  priority: true,
  name: 'Bory i lasy bagienne (Vaccinio uliginosi-Betuletum pubescentis, Vaccinio uliginosi-Pinetum, Pino mugo-Sphagnetum, Sphagno girgensohnii-Piceetum i brzozowo-sosnowe bagienne lasy borealne)',
  source: 'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, rozdz. 91D0 Bory i lasy bagienne (tab. 1 i 2)',

  siteFields: [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      placeholder: 'np. Reptowo XI',
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Reptowo XI”. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: obserwacje powtarza się co 3–6 lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend.`,
    },
    pick7120('guid'),
    {
      kind: 'select',
      name: 'variant',
      label: 'Wariant siedliska',
      options: VARIANT_OPTIONS,
      required: true,
      hint: 'Od wariantu zależy lista gatunków charakterystycznych, kardynalność torfowców i to, czy liczą się krzewinki.',
      help: `Wybierz wariant, do którego należy płat na transekcie:
• bór bagienny – sosnowy Vaccinio uliginosi-Pinetum (także górskie bory i kosodrzewina na torfie, Pino mugo-Sphagnetum),
• brzezina bagienna – Vaccinio uliginosi-Betuletum pubescentis, z brzozą omszoną w drzewostanie,
• świerczyna bagienna – borealna Sphagno girgensohnii-Piceetum (północny wschód) i świerczyny górskie na torfie,
• borealny las sosnowo-brzozowy – bagienne lasy brzozowo-sosnowe północno-wschodniej Polski.

Gdy płat jest przejściowy (np. sosna i brzoza omszona współdominują), wybierz wariant, który lepiej opisuje runo i warstwę mchów, a w „Zbiorowiskach roślinnych” wpisz oba zespoły.

Dlaczego: przewodnik podaje osobną listę gatunków charakterystycznych dla każdego wariantu. Torfowce są wskaźnikiem kardynalnym tylko w borach bagiennych, a krzewinek nie ocenia się w świerczynach i borealnych lasach sosnowo-brzozowych, bo tam z natury ich brak.`,
    },
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      hint: 'Np. Vaccinio uliginosi-Pinetum, Vaccinio uliginosi-Betuletum pubescentis.',
      help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi. Dla 91D0 to: Vaccinio uliginosi-Pinetum (sosnowy bór bagienny), Vaccinio uliginosi-Betuletum pubescentis (brzezina bagienna), Pino mugo-Sphagnetum (kosodrzewina na torfowiskach), Sphagno girgensohnii-Piceetum (świerczyna bagienna) i brzozowo-sosnowe bagienne lasy borealne. Postać zdegradowaną zaznacz wprost („silnie zdegradowane Vaccinio uliginosi-Pinetum”).

Dlaczego: zespół wyznacza punkt odniesienia dla oceny – czego się spodziewać w drzewostanie, runie i warstwie mchów.`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 10,
      required: true,
      hint: 'Położenie, historia (odwodnienie, eksploatacja torfu, gospodarka leśna), drzewostan, runo, mchy.',
      help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat i czym są wyznaczone jego granice;
• historia: odwodnienie, pozyskanie torfu, gospodarka leśna;
• drzewostan: gatunki, ich udział, wiek;
• runo i krzewinki: czy dominują krzewinki bagienne (bagno, borówka bagienna), czy gatunki borów świeżych (borówka czarna, trzęślica, orlica);
• warstwa mchów: torfowce czy mchy suchych borów (rokietnik, brodawkowiec, widłoząb).

Dlaczego: bór bagienny rośnie na torfie i żyje dzięki wysokiemu poziomowi wody. Opis pokazuje, czy płat jest nadal bagienny, czy już przechodzi w bór świeży, i pozwala kolejnemu obserwatorowi zrozumieć przyczyny zmian.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatu siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Powierzchnia płatu siedliska 91D0 na stanowisku, w hektarach. Nie powierzchnia transektu (0,2 ha) ani całego kompleksu leśnego. Najlepiej z GIS (ortofotomapa, mapa leśna) albo z operatu urządzeniowego.

Dlaczego: zmiana powierzchni płatu między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
    },
    pick7120('protectedAreas'),
    {
      kind: 'text',
      name: 'coordStart',
      group: 'Współrzędne geograficzne',
      wide: true,
      label: 'Początek transektu',
      required: true,
      placeholder: '53° 23\' 24,931" N 14° 49\' 33,465" E',
      help: COORD_HELP('początku'),
    },
    { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: COORD_HELP('środka') },
    { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: COORD_HELP('końca') },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: '200x10 m',
      required: true,
      hint: 'Standard to 200×10 m.',
      help: `Faktyczne wymiary transektu. Standard to pas 200×10 m z trzema zdjęciami fitosocjologicznymi po 100 m². Gdy taki transekt nie mieści się w płacie, zmień wymiary przy zachowaniu powierzchni (0,2 ha) i wpisz faktyczne.

Dlaczego: wszystkie pokrycia (%) liczy się względem powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 19',
      required: true,
      help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres.

Dlaczego: kontekst geograficzny – niżowe bory bagienne i górskie postaci siedliska (Sudety, Karpaty) mają inny skład gatunkowy.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 14.07.2025',
      required: true,
      hint: 'Optymalnie od czerwca do września.',
      help: `Dzień obserwacji w terenie. Optymalny termin dla 91D0 to czerwiec–wrzesień; uproszczone obserwacje są możliwe w każdej bezśnieżnej porze roku.

Dlaczego: siedlisko jest późne fenologicznie. Wiosną rośliny zielne nie są jeszcze rozwinięte, a późną jesienią borówki tracą liście, co utrudnia ocenę pokrycia i pełny spis gatunków. Badanie powtarza się co 3 lata (najrzadziej co 5–6).`,
      warn: (v) => {
        if (!isIsoDate(v)) return null
        const m = Number(v.split('-')[1])
        return m >= 6 && m <= 9 ? null : 'Termin poza optymalnym oknem (czerwiec–wrzesień). Pokrycie runa i spis gatunków mogą być niepełne.'
      },
    },
    pick7120('observer'),
  ],

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne w obrębie transektu, każde o powierzchni 100 m² (np. 10×10 m), w skali Braun-Blanqueta. Gdy płat ma nietypowy kształt, zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: methodology7120.releves.fields.map((f): FieldDef => {
      switch (f.name) {
        case 'coords':
          return { ...f, help: 'Współrzędne GPS środka powierzchni zdjęcia (100 m²). Zdjęcia robi się zwykle na początku, w środku i na końcu transektu.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.' }
        case 'area':
          return {
            ...f,
            defaultValue: 100,
            help: 'Powierzchnia zdjęcia w m². Standard dla 91D0 to 100 m² (np. 10×10 m). Zmieniaj tylko wtedy, gdy płat jest za mały, i wpisz faktyczną wartość.\n\nDlaczego: liczba gatunków rośnie z powierzchnią – zdjęcia o różnej wielkości nie są porównywalne.',
          }
        case 'coverA':
          return { ...f, help: 'Warstwa A – drzewostan. Procent powierzchni zdjęcia przykryty koronami drzew, w rzucie pionowym.\n\nDlaczego: zwarcie drzewostanu odróżnia bór bagienny od otwartego torfowiska i pokazuje, czy drzewostan się zagęszcza (często skutek przesuszenia).' }
        case 'coverB':
          return { ...f, help: 'Warstwa B – podszyt i podrost: młode sosny, brzozy, świerki, kruszyna, jarząb.\n\nDlaczego: w warstwie B widać odnowienie drzewostanu, ale też gęsty nalot brzozy w degradującym się borze sosnowym.' }
        case 'coverC':
          return { ...f, help: 'Warstwa C – runo: krzewinki (bagno, borówki, żurawina), rośliny zielne, siewki drzew.\n\nDlaczego: w runie najlepiej widać kierunek zmian: krzewinki bagienne (dobrze) albo borówka czarna, trzęślica i orlica (przesuszenie).' }
        case 'coverD':
          return { ...f, help: 'Warstwa D – mszysta: torfowce, inne mchy, wątrobowce, porosty naziemne.\n\nDlaczego: w borze bagiennym warstwa mchów to głównie torfowce. Zastępowanie ich przez rokietnik, brodawkowiec i widłoząb oznacza przesuszenie.' }
        case 'heightA':
        case 'heightB':
        case 'heightC':
        case 'heightD':
          return { ...f, help: `${String(f.help).split('\n')[0]}\n\nDlaczego: wysokości warstw opisują strukturę pionową płatu – zróżnicowana struktura to jeden ze wskaźników właściwego stanu.` }
        case 'unit':
          return { ...f, help: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Vaccinio uliginosi-Pinetum (postać zdegradowana)”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy płat przechodzi w inne zbiorowisko (np. bór świeży).' }
        default:
          return f
      }
    }),
  },

  indicators: [
    {
      id: 'area',
      label: 'Powierzchnia siedliska na stanowisku',
      parameter: 'area',
      description:
        'Trend zmian powierzchni płatu oraz jego antropogeniczna fragmentacja (zręby, groble, drogi). Liczy się tylko trend aktualny.',
      help: `Co wybrać: jak zmienia się powierzchnia płatu 91D0 i czy jest on pocięty przez człowieka (zręby, groble, drogi, linie przesyłowe).

Pułapki:
• nie licz jako spadku ubytku boru wskutek celowego odtwarzania bezleśnych torfowisk (np. 7110) – to działanie ochronne;
• nie licz jako fragmentacji rozproszenia płatów wynikającego z naturalnych warunków (kępy boru wśród torfowiska);
• liczy się trend aktualny, nie dawne zmiany.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie zmniejsza się” albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana',
        U1: 'Powolny trend spadkowy (bez spadku wskutek celowego odtwarzania bezleśnych torfowisk) lub antropogeniczna fragmentacja',
        U2: 'Szybki trend spadkowy (bez spadku wskutek celowego odtwarzania bezleśnych torfowisk) lub silna antropogeniczna fragmentacja',
      },
      inputs: [selectInput('Jak zmienia się powierzchnia?', AREA_TREND, 'Wybierz kierunek zmiany. Pułapki (odtwarzanie torfowisk, naturalne rozproszenie płatów) są opisane pod „?” przy nazwie wskaźnika.')],
      suggest: byOption({ stable: 'FV', slow: 'U1', fast: 'U2' }),
      describe: (i) => labelOf(AREA_TREND, i.choice),
    },
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne',
      parameter: 'structure',
      cardinal: true,
      description:
        'Udział gatunków z listy charakterystycznej dla wariantu siedliska. Lista zależy od wariantu wybranego w „Stanowisku”.',
      help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %. Formularz porównuje je z listą dla wariantu wybranego w „Stanowisku”:
• bór bagienny: bagno zwyczajne, borówka bagienna, torfowce (dowolny gatunek Sphagnum), żurawina błotna, modrzewnica, wełnianka pochwowata;
• brzezina bagienna: jak bór bagienny + widłak jałowcowaty i brzoza omszona;
• świerczyna bagienna: gwiazdnica długolistna, listera sercowata, torfowce, widłak jałowcowaty;
• borealny las sosnowo-brzozowy: brzoza omszona, zachylnik błotny, turzyca strunowa, bobrek, kruszczyk błotny, dziewięciornik, torfowce, żurawina, wełnianka pochwowata.

Wszystkie torfowce liczą się jako jedna pozycja listy. Progi: ponad 60% listy – FV, 30–60% – U1, poniżej 30% – U2.

Uwaga z przewodnika: nie każdy gatunek musi rosnąć w każdym płacie (np. borówka bagienna jest regionalnie rzadka). Ocenę obniżaj tylko wtedy, gdy brak gatunków to skutek degeneracji, a nie lokalnej specyfiki – wtedy popraw podpowiedź i uzasadnij w opisie.

Dlaczego: gatunki charakterystyczne są wskaźnikami dobrego stanu boru bagiennego. Ich zanik oznacza, że płat przestaje być bagienny. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Obecnych ponad 60% listy gatunków charakterystycznych',
        U1: 'Obecnych 30–60% listy gatunków charakterystycznych',
        U2: 'Obecnych poniżej 30% listy gatunków charakterystycznych',
      },
      inputs: [speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki z listy dla wariantu siedliska (lista jest pod „?” przy nazwie wskaźnika), z pokryciem w % transektu.', true)],
      suggest: (i, ctx) => {
        const v = variantOf(ctx?.site)
        const rows = speciesRows(i.species)
        if (!v || !rows.some((r) => r.name?.trim())) return null
        const { share } = characteristicMatch(rows, v)
        return share > 60 ? 'FV' : share >= 30 ? 'U1' : 'U2'
      },
      explain: (i, ctx) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const v = variantOf(ctx?.site)
        if (!v) return 'Wybierz wariant siedliska w „Stanowisku” – od niego zależy lista gatunków charakterystycznych.'
        const { present, missing, share } = characteristicMatch(rows, v)
        const n = VARIANTS_91D0[v].list.length
        return `Wariant: ${variantName(ctx)}. Obecne ${present.length} z ${n} pozycji listy (${share}%): ${present.join(', ') || '—'}. Brak: ${missing.join(', ') || '—'}.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'dominant',
      label: 'Gatunki dominujące',
      parameter: 'structure',
      description:
        'Czy w każdej warstwie dominują gatunki typowe dla wariantu siedliska (np. w borze bagiennym: sosna, krzewinki bagienne, torfowce).',
      help: `Co wpisać: dominanty każdej warstwy z pokryciem (A – drzewostan, B – podszyt, C – runo, D – mchy) i ocenę, czy są to gatunki typowe dla naturalnego zbiorowiska.

Przykład dla sosnowego boru bagiennego: naturalnie dominują sosna (A), bagno i borówka bagienna (C) oraz torfowce (D). Dominacja borówki czarnej, trzęślicy albo orlicy w runie czy rokietnika i brodawkowca w mchach to dominacja gatunków nietypowych – sygnał przesuszenia.

Formularz ostrzega, gdy na liście są gatunki ekspansywne, obce albo mchy borów świeżych z pokryciem co najmniej 10%, a wybrano „naturalne”.

Dlaczego: struktura dominacji pokazuje, czy płat jest nadal bagienny, czy przechodzi w inny typ lasu.`,
      thresholds: {
        FV: 'We wszystkich warstwach dominują gatunki, które dominują w naturalnym zbiorowisku, a stosunki ilościowe są naturalne',
        U1: 'We wszystkich warstwach dominują te gatunki, ale stosunki ilościowe są zachwiane',
        U2: 'W jednej lub więcej warstw dominuje gatunek inny niż zwykle w naturalnym zbiorowisku',
      },
      inputs: [
        speciesInput('Gatunki dominujące w warstwach', 'Dominanty każdej warstwy z pokryciem w % transektu. Warstwę dopisz w opisie wskaźnika („A: Pinus sylvestris 45%; C: …”).'),
        selectInput('Czy dominanty są typowe?', DOMINANCE),
      ],
      suggest: byOption({ natural: 'FV', disturbed: 'U1', foreign: 'U2' }),
      warn: (i) => {
        if (i.choice !== 'natural') return null
        const bad = speciesRows(i.species).filter((r) => {
          const g = findSpecies91D0(r.name ?? '')?.group
          return (num(r.cover) ?? 0) >= 10 && (g === 'expansive' || g === 'dry-moss' || g === 'invasive' || g === 'tree-geo-alien' || g === 'tree-eco-alien')
        })
        return bad.length
          ? `Wybrano „naturalne”, a dominują też: ${bad.map((r) => r.name).join(', ')} – to gatunki nietypowe dla boru bagiennego.`
          : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'invasive',
      label: 'Inwazyjne gatunki obce w runie',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki obce geograficznie w runie, np. tawuła kutnerowata Spiraea tomentosa. Bory bagienne są mało podatne na inwazje.',
      help: `Co wpisać: każdy gatunek obcy geograficznie w runie (i podszycie), z pokryciem. Najczęstszy problem to tawuła kutnerowata Spiraea tomentosa (zwłaszcza Bory Dolnośląskie), rzadziej borówka wysoka (amerykańska) czy niecierpek drobnokwiatowy. Brak – zostaw listę pustą.

Progi z przewodnika są opisowe („nieliczny, sporadyczny”, „liczny”). Formularz przyjmuje: brak gatunków – FV; jeden gatunek o pokryciu do 1% – U1; więcej gatunków albo jeden powyżej 1% – U2. To interpretacja, nie norma – przy innej ocenie popraw podpowiedź.

Dlaczego: przewodnik każe odnotować każdy gatunek obcy, ale obniżać ocenę tylko przy lokalnej inwazyjności. Obecność obcych w runie oznacza zwykle przesuszenie i zmianę warunków. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Obecny najwyżej 1 gatunek, nieliczny, sporadyczny',
        U2: 'Więcej niż 1 gatunek lub nawet 1 gatunek liczny',
      },
      inputs: [speciesInput('Inwazyjne gatunki obce w runie', 'Gatunki obce geograficznie w runie z pokryciem w % transektu. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return 'FV'
        if (count === 1 && total !== undefined && total <= 1) return 'U1'
        return total === undefined && count === 1 ? null : 'U2'
      },
      explain: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return null
        return `Gatunków: ${count}, łączne pokrycie ${fmt(total)}. Próg „nieliczny” przyjęto jako pokrycie do 1% – to interpretacja.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Brak',
    },
    {
      id: 'expansive',
      label: 'Rodzime gatunki ekspansywne roślin zielnych',
      parameter: 'structure',
      description:
        'Ekspansja apofitów nietypowych dla dobrze zachowanych płatów: trzęślica, borówka czarna, jeżyny, trzcinnik piaskowy, orlica.',
      help: `Co wpisać: rodzime gatunki, które wyraźnie się rozprzestrzeniają, z pokryciem: trzęślica modra Molinia caerulea, borówka czarna Vaccinium myrtillus, jeżyny Rubus spp., trzcinnik piaskowy Calamagrostis epigejos, orlica Pteridium aquilinum. Gęsty nalot brzozy w degradującym się borze sosnowym też jest ekspansją (dopisz go). Neofitów (gatunków obcych) tu nie wpisuj – mają swój wskaźnik.

Progi z przewodnika są opisowe. Formularz przyjmuje: brak – FV; jeden gatunek o pokryciu do 25% – U1 („nie bardzo silnie ekspansywny”); więcej gatunków albo jeden powyżej 25% – U2. To interpretacja.

Dlaczego: borówka czarna, trzęślica i orlica wkraczają, gdy torf przesycha i murszeje. Ich ekspansja pokazuje, że płat przechodzi w bór świeży albo wilgotny.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Obecne, lecz najwyżej 1 gatunek, nie bardzo silnie ekspansywny',
        U2: 'Więcej niż 1 gatunek albo 1 gatunek bardzo silnie ekspansywny',
      },
      inputs: [speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return 'FV'
        if (count > 1) return 'U2'
        return total === undefined ? null : total <= 25 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return null
        return `Gatunków ekspansywnych: ${count}, łączne pokrycie ${fmt(total)}. Próg „bardzo silnie ekspansywny” przyjęto jako ponad 25% – to interpretacja.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Brak',
    },
    {
      id: 'hydration',
      label: 'Uwodnienie',
      parameter: 'structure',
      cardinal: true,
      description:
        'Czy warunki wodne są naturalne, bagienne. Każde przesuszenie obniża ocenę. Najlepiej z piezometru (także automatycznego).',
      help: `Co wybrać: stan uwodnienia płatu. Przewodnik nie podaje progów liczbowych, więc ocena jest ekspercka. Pomagają:
• piezometr na stanowisku (najlepiej z automatycznym rejestratorem poziomu wody) – wpisz odczyt;
• dołek wykopany łopatką: po kilkunastu minutach zmierz, jak głęboko stoi woda;
• roślinność: torfowce i krzewinki bagienne (dobrze) albo borówka czarna, trzęślica, rokietnik (przesuszenie);
• czynne rowy odwadniające w pobliżu.

Pojedynczy pomiar w okresie niskich stanów wody (lipiec–sierpień) opisz jako taki w uwagach.

Gdy uwodnienie poprawia się dzięki ochronie czynnej (zastawki), przewodnik dopuszcza dopisek „U1+” (niezadowalające, z tendencją do poprawy) albo „U1−” – wpisz go w opisie.

Dlaczego: bór bagienny istnieje tylko dzięki wysokiemu poziomowi wody. Przesuszony torf murszeje, a bór przechodzi w bór świeży. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Właściwe, bagienne uwodnienie',
        U1: 'Nieco przesuszone',
        U2: 'Silnie przesuszone',
      },
      inputs: [
        selectInput('Stan uwodnienia', HYDRATION),
        {
          kind: 'number',
          name: 'depth',
          label: 'Poziom wody pod powierzchnią (jeśli mierzony)',
          unit: 'cm',
          min: -100,
          max: 500,
          help: 'Głębokość lustra wody pod powierzchnią gruntu w cm – z piezometru albo dołka. Woda nad powierzchnią – liczba ujemna. Pole opcjonalne, ocena wynika z wybranego stanu.',
        },
      ],
      suggest: byOption({ proper: 'FV', slight: 'U1', strong: 'U2' }),
      warn: (i) => {
        const d = num(i.depth)
        if (d === undefined) return null
        if (i.choice === 'proper' && d > 40) return `Woda ${d} cm pod powierzchnią, a wybrano „właściwe” – sprawdź, czy to nie przesuszenie.`
        return null
      },
      describe: (i) => {
        const d = num(i.depth)
        return [labelOf(HYDRATION, i.choice), d === undefined ? '' : `poziom wody ${String(d).replace('.', ',')} cm pod powierzchnią`].filter(Boolean).join(', ')
      },
    },
    {
      id: 'age',
      label: 'Wiek drzewostanu',
      parameter: 'structure',
      description: 'Dojrzałość fitocenozy mierzona udziałem (miąższością) drzew starszych niż 100 i 50 lat.',
      help: `Co wybrać: udział drzew starszych niż 100 lat i starszych niż 50 lat w drzewostanie (udział objętościowy, czyli miąższość). Dane zwykle są w leśnym operacie urządzeniowym albo Banku Danych o Lasach – sprawdź wydzielenie, w którym leży transekt. Liczby możesz dopisać w polach poniżej; ocena wynika z wybranej klasy.

Progi są wspólne dla wszystkich gatunków drzew, choć brzozy i świerki rzadko dożywają 100 lat (dla sosny 100 lat to nic nadzwyczajnego).

Dlaczego: stary drzewostan oznacza ciągłość lasu i dojrzałą fitocenozę. Wskaźnik pomocniczy – w niektórych obszarach starsze drzewostany są w gorszym stanie niż młode.`,
      thresholds: {
        FV: 'Ponad 20% udziału objętościowego drzew starszych niż 100 lat',
        U1: 'Poniżej 20% udziału drzew starszych niż 100 lat, ale ponad 50% udziału drzew starszych niż 50 lat',
        U2: 'Poniżej 20% udziału drzew starszych niż 100 lat i poniżej 50% udziału drzew starszych niż 50 lat',
      },
      inputs: [
        selectInput('Klasa wieku drzewostanu', AGE),
        pct('share100', 'Udział drzew >100 lat', { required: false, help: 'Udział objętościowy (miąższość) drzew starszych niż 100 lat, w %. Opcjonalne.' }),
        pct('share50', 'Udział drzew >50 lat', { required: false, help: 'Udział objętościowy drzew starszych niż 50 lat (łącznie z tymi >100 lat), w %. Opcjonalne.' }),
      ],
      suggest: byOption({ old: 'FV', mid: 'U1', young: 'U2' }),
      warn: (i) => {
        const a = num(i.share100)
        const b = num(i.share50)
        if (a === undefined || !i.choice) return null
        const fromNumbers = a > 20 ? 'old' : b !== undefined ? (b > 50 ? 'mid' : 'young') : undefined
        return fromNumbers && fromNumbers !== i.choice
          ? `Liczby wskazują na klasę: „${labelOf(AGE, fromNumbers)}”.`
          : null
      },
      describe: (i) => {
        const a = num(i.share100)
        const b = num(i.share50)
        const nums = [a === undefined ? '' : `>100 lat: ${fmt(a)}`, b === undefined ? '' : `>50 lat: ${fmt(b)}`].filter(Boolean).join(', ')
        return [labelOf(AGE, i.choice), nums].filter(Boolean).join(' – ')
      },
    },
    {
      id: 'geoAlien',
      label: 'Gatunki obce geograficznie w drzewostanie',
      parameter: 'structure',
      cardinal: true,
      description:
        'Drzewa poza naturalnym zasięgiem, w praktyce głównie świerk na Pomorzu i w Wielkopolsce, wyjątkowo modrzew, sosna wejmutka.',
      help: `Co wpisać: każdy gatunek drzewa rosnący poza swoim naturalnym zasięgiem, z udziałem w drzewostanie w %, oraz czy się odnawia (siewki, podrost).

Uwaga: świerk pospolity Picea abies jest obcy geograficznie tylko poza naturalnym zasięgiem (np. na Pomorzu Zachodnim, w Wielkopolsce). W północno-wschodniej Polsce i w górach jest rodzimy i budujący świerczyny bagienne – wtedy go tu nie wpisuj. Dlatego formularz liczy wszystko, co wpiszesz na tę listę.

Przypadkowe 1–2 osobniki można tolerować nawet przy FV. Każdy większy udział, a zwłaszcza odnawianie się, obniża ocenę.

Dlaczego: obce drzewa zmieniają skład ściółki, zacienienie i warunki wodne. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Poniżej 1% i nie odnawiające się',
        U1: 'Poniżej 10% i nie odnawiające się',
        U2: 'Ponad 10% lub odnawiające się',
      },
      inputs: [
        speciesInput('Gatunki obce geograficznie w drzewostanie', 'Gatunki drzew poza naturalnym zasięgiem, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.'),
        {
          kind: 'select',
          name: 'regenerating',
          label: 'Czy się odnawiają?',
          options: REGENERATING,
          help: 'Czy pod drzewostanem są siewki albo podrost gatunku obcego. Odnawianie się gatunku obcego zawsze daje U2, niezależnie od udziału – bo oznacza, że gatunek sam się rozprzestrzenia.',
        },
      ],
      suggest: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return 'FV'
        if (i.regenerating === 'yes') return 'U2'
        if (total === undefined) return null
        return total < 1 ? 'FV' : total < 10 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const { count, total } = listCover(i)
        if (count === 0) return null
        return `Łączny udział gatunków obcych geograficznie: ${fmt(total)}${i.regenerating === 'yes' ? ', odnawiają się' : ''}.`
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (!list) return 'Brak'
        return i.regenerating === 'yes' ? `${list} (odnawia się)` : list
      },
    },
    {
      id: 'ecoAlien',
      label: 'Gatunki obce ekologicznie w drzewostanie',
      parameter: 'structure',
      description:
        'Rodzime drzewa nietypowe dla boru bagiennego, np. buk i dąb w przesuszonych brzezinach bagiennych. Do 10% jest tolerowane.',
      help: `Co wpisać: rodzime gatunki drzew, które nie należą do boru bagiennego, z udziałem w drzewostanie w %: buk, dęby, grab, czasem świerk w borze sosnowym poza świerczynami. Gatunków obcych geograficznie tu nie wpisuj – mają swój wskaźnik.

Dlaczego: buk i dąb wkraczają, gdy torf przesycha – ich udział pokazuje, jak daleko zaszła przemiana w las na glebie mineralnej.`,
      thresholds: { FV: 'Poniżej 10%', U1: 'Poniżej 30%', U2: 'Ponad 30%' },
      inputs: [speciesInput('Gatunki obce ekologicznie w drzewostanie', 'Gatunki drzew nietypowe dla siedliska, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const { total } = listCover(i)
        if (total === undefined) return null
        return total < 10 ? 'FV' : total < 30 ? 'U1' : 'U2'
      },
      explain: (i) => (listCover(i).count ? `Łączny udział: ${fmt(listCover(i).total)}.` : null),
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Brak',
    },
    {
      id: 'deadWood',
      label: 'Martwe drewno leżące lub stojące > 3 m długości i 30 cm grubości',
      parameter: 'structure',
      description: 'Liczba sztuk grubego martwego drewna na hektar. Dla 91D0 próg FV jest niższy niż w innych lasach.',
      help: `Co wpisać: klasę liczby kłód leżących i drzew martwych stojących (złomy, wywroty, susze) o długości ponad 3 m i grubości ponad 30 cm, przeliczoną na hektar. Na transekcie 200×10 m (0,2 ha) policz sztuki i pomnóż przez 5.

Dlaczego: grube martwe drewno to mikrosiedlisko dla grzybów, mszaków i bezkręgowców. W borach bagiennych bywa go mało (młode drzewostany, brak użytkowania), dlatego próg FV to tylko ponad 3 szt./ha. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Ponad 3 szt./ha', U1: '1–3 szt./ha', U2: 'Poniżej 1 szt./ha' },
      inputs: [
        selectInput('Ile grubego martwego drewna?', DEAD_WOOD, 'Klasa liczby sztuk na hektar. Gdy liczyłeś, wpisz też liczbę poniżej – formularz sprawdzi zgodność.'),
        {
          kind: 'number',
          name: 'perHa',
          label: 'Liczba sztuk na hektar (jeśli liczona)',
          unit: 'szt./ha',
          min: 0,
          help: 'Sztuki martwego drewna >3 m długości i >30 cm grubości na hektar. Z transektu 0,2 ha: liczba sztuk × 5. Opcjonalne.',
        },
      ],
      suggest: (i) => {
        const v = num(i.perHa)
        if (v !== undefined) return v > 3 ? 'FV' : v >= 1 ? 'U1' : 'U2'
        return byOption({ many: 'FV', some: 'U1', few: 'U2' })(i)
      },
      warn: (i) => {
        const v = num(i.perHa)
        if (v === undefined || !i.choice) return null
        const cls = v > 3 ? 'many' : v >= 1 ? 'some' : 'few'
        return cls === i.choice ? null : `${String(v).replace('.', ',')} szt./ha to klasa „${labelOf(DEAD_WOOD, cls)}”.`
      },
      describe: (i) => {
        const v = num(i.perHa)
        return v === undefined ? labelOf(DEAD_WOOD, i.choice) : `${String(v).replace('.', ',')} szt./ha`
      },
    },
    {
      id: 'regeneration',
      label: 'Naturalne odnowienie drzewostanu',
      parameter: 'structure',
      description:
        'Czy gatunki drzew typowe dla wariantu siedliska mają możliwość odnawiania się. Liczy się potencjał, nie ilość.',
      help: `Co wybrać: czy w płacie są siewki i podrost gatunków drzew właściwych dla wariantu (sosna w borze bagiennym, brzoza omszona w brzezinie, świerk w świerczynie). W opisie wymień gatunek, np. „Odnawia się brzoza omszona”.

Pułapka: gęsty podrost brzozowy w degradującym się borze sosnowym to nie odnowienie, tylko ekspansja – wpisz go we wskaźniku „Rodzime gatunki ekspansywne”.

Dlaczego: drzewostan powinien się utrzymywać sam. Brak odnowienia może być chwilowy, więc wskaźnik jest pomocniczy i nie przesądza o ocenie struktury.`,
      thresholds: { FV: 'Tak, obfite', U1: 'Tak, lecz pojedyncze', U2: 'Brak' },
      inputs: [selectInput('Odnowienie gatunków typowych', REGENERATION)],
      suggest: byOption({ abundant: 'FV', single: 'U1', none: 'U2' }),
      describe: (i) => labelOf(REGENERATION, i.choice),
    },
    {
      id: 'sphagnum',
      label: 'Występowanie mchów torfowców',
      parameter: 'structure',
      cardinal: (ctx) => isPineBog(ctx),
      description:
        'Pokrycie i zróżnicowanie gatunkowe torfowców. Wskaźnik kardynalny tylko w sosnowych borach bagiennych.',
      help: `Co wpisać: torfowce na transekcie z pokryciem (każdy gatunek osobno) i ocenę ich stanu:
• FV – torfowce dominują w warstwie mchów, kilka gatunków;
• U1 – pokrycie albo liczba gatunków wyraźnie obniżone;
• U2 – brak torfowców albo bardzo niskie pokrycie (np. poniżej 1% transektu).

Kardynalność zależy od wariantu: w borze bagiennym (sosnowym) torfowce są wskaźnikiem kardynalnym, w brzezinach, świerczynach i borealnych lasach sosnowo-brzozowych – pomocniczym, bo naturalnie bywa ich mało.

Dlaczego: torfowce utrzymują wodę i budują torf. Ich zastępowanie przez rokietnika, brodawkowca i widłozęby to najczytelniejszy znak przesuszenia boru bagiennego.`,
      thresholds: {
        FV: 'Dominują w runie, normalne zróżnicowanie gatunkowe',
        U1: 'Obniżone pokrycie albo różnorodność gatunkowa',
        U2: 'Brak lub bardzo niskie pokrycie',
      },
      inputs: [
        speciesInput('Torfowce na transekcie', 'Każdy gatunek torfowca z pokryciem w % transektu.'),
        selectInput('Stan torfowców', SPHAGNUM),
      ],
      suggest: byOption({ dominant: 'FV', reduced: 'U1', none: 'U2' }),
      explain: (i, ctx) => {
        const s = rowsOfGroups(speciesRows(i.species), ['sphagnum'])
        const card = isPineBog(ctx) ? 'Wskaźnik kardynalny (bór bagienny).' : 'Wskaźnik pomocniczy przy tym wariancie.'
        if (!s.names.length) return card
        return `${card} Torfowców: ${s.names.length}, łączne pokrycie ${fmt(s.total)}.`
      },
      warn: (i) => {
        const s = rowsOfGroups(speciesRows(i.species), ['sphagnum'])
        if (i.choice === 'dominant' && s.total !== undefined && s.total < 10)
          return `Torfowce pokrywają ${fmt(s.total)} transektu – trudno mówić o dominacji.`
        return null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'dwarfShrubs',
      label: 'Występowanie charakterystycznych krzewinek',
      parameter: 'structure',
      description:
        'Bagno zwyczajne i borówka bagienna. Nie stosuje się w świerczynach i borealnych lasach sosnowo-brzozowych.',
      help: `Co wpisać: bagno zwyczajne Ledum palustre i borówkę bagienną Vaccinium uliginosum z pokryciem oraz ocenę ich obfitości.

Nie obniżaj oceny, gdy jeden z gatunków jest lokalnie bardzo rzadki i z natury nie rośnie w tej okolicy (np. bory bagienne Puszczy Drawskiej zwykle nie mają borówki bagiennej).

W świerczynach bagiennych i borealnych lasach sosnowo-brzozowych krzewinki z natury nie występują albo są skąpe – wskaźnika się nie stosuje i formularz podpowiada XX.

Dlaczego: krzewinki bagienne są typowe dla runa boru i brzeziny bagiennej. Ustępują borówce czarnej, gdy torf przesycha.`,
      thresholds: {
        FV: 'Występują z normalną obfitością (z uwzględnieniem lokalnej specyfiki)',
        U1: 'Występują skąpo',
        U2: 'Zupełnie brak',
      },
      inputs: [
        speciesInput('Krzewinki bagienne', 'Bagno zwyczajne, borówka bagienna – z pokryciem w % transektu.'),
        { ...selectInput('Obfitość krzewinek', DWARF), required: false },
      ],
      suggest: (i, ctx) => {
        if (noDwarfShrubs(ctx)) return 'XX'
        return byOption({ normal: 'FV', sparse: 'U1', none: 'U2' })(i)
      },
      explain: (_i, ctx) =>
        noDwarfShrubs(ctx) ? `Wariant „${variantName(ctx)}” – przewodnik nie stosuje tego wskaźnika (krzewinki z natury nie występują).` : null,
      describe: (i, ctx) => {
        if (noDwarfShrubs(ctx)) return 'Nie dotyczy wariantu siedliska'
        const list = describeSpecies(speciesRows(i.species))
        return list || (i.choice === 'none' ? 'Brak' : labelOf(DWARF, i.choice))
      },
    },
    {
      id: 'vertical',
      label: 'Pionowa struktura roślinności',
      parameter: 'structure',
      description: 'Zróżnicowanie struktury wiekowej i warstwowej drzewostanu. Nadmierne wyrównanie obniża ocenę.',
      help: `Co wybrać: czy drzewostan jest wielogeneracyjny – są drzewa różnego wieku i wysokości, luki, podrost, warstwy A, B, C, D – czy wyrównany jak uprawa leśna (jednowiekowy, jednopiętrowy, sadzony w rzędach).

Dlaczego: naturalny bór bagienny ma luźny, zróżnicowany drzewostan. Ujednolicenie oznacza gospodarkę leśną nastawioną na produkcję drewna, a nie naturalną dynamikę.`,
      thresholds: {
        FV: 'Naturalna, zróżnicowana',
        U1: 'Antropogenicznie zmieniona, lecz zróżnicowana',
        U2: 'Antropogenicznie ujednolicona',
      },
      inputs: [selectInput('Struktura pionowa', VERTICAL)],
      suggest: byOption({ natural: 'FV', changed: 'U1', uniform: 'U2' }),
      describe: (i) => {
        const l = labelOf(VERTICAL, i.choice)
        return l ? `${l} struktura` : ''
      },
    },
    {
      id: 'logging',
      label: 'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      parameter: 'structure',
      description:
        'Ślady zrywki, uszkodzenia drzew, zaśmiecenie po pracach leśnych. Liczy się naruszenie runa i gleby, nie sam fakt pozyskania.',
      help: `Co wybrać: jak bardzo prace leśne naruszyły runo, glebę (torf), podszyt, podrost i zasoby martwego drewna. Patrz na koleiny po zrywce, rozjeżdżony torf, uszkodzone drzewa, pozostałości po pracach. Same pniaki to jeszcze nie zniszczenie.

Dlaczego: bory bagienne bardzo źle znoszą użytkowanie – rozjeżdżony torf długo się nie regeneruje, a koleiny działają jak rowy. Wskaźnik pomocniczy: ekstensywne użytkowanie nie przesądza o ocenie.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Nieliczne ślady, naruszone poniżej 1% powierzchni terenu, liczby drzew',
        U2: 'Znaczące, obejmujące ponad 1% powierzchni terenu, liczby drzew itp.',
      },
      inputs: [selectInput('Zniszczenia po pozyskaniu drewna', LOGGING)],
      suggest: byOption({ none: 'FV', few: 'U1', significant: 'U2' }),
      describe: (i) => labelOf(LOGGING, i.choice),
    },
    {
      id: 'otherDistortions',
      label: 'Inne zniekształcenia',
      parameter: 'structure',
      description: 'Np. rozjeżdżanie, wydeptywanie, zaśmiecenie, rowy, doły potorfowe.',
      help: `Co wybrać i opisać: inne przekształcenia płatu niezwiązane z pozyskaniem drewna – rozjeżdżanie, wydeptywanie, zaśmiecenie, rowy odwadniające, doły i ściany potorfowe, groble, drogi. W polu opisu wymień je krótko (np. „Rowy i potorfia”).

Dlaczego: każde z tych zniekształceń zmienia warunki wodne albo niszczy runo. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Brak', U1: 'Występują, lecz mało znaczące', U2: 'Silne' },
      inputs: [selectInput('Inne zniekształcenia', DISTORTIONS)],
      suggest: byOption({ none: 'FV', minor: 'U1', strong: 'U2' }),
      describe: (i) => labelOf(DISTORTIONS, i.choice),
    },
    {
      id: 'keySpecies',
      label: 'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
      parameter: 'structure',
      description:
        'Stosować tylko, gdy są dane: np. malina moroszka, chamedafne, bażyna, głuszec, modraszek bagniczek, szlaczkoń torfowiec.',
      help: `Co wybrać: stan gatunków chronionych, zagrożonych i rzadkich, typowych lokalnie dla boru bagiennego, np. malina moroszka Rubus chamaemorus, chamedafne północna Chamaedaphne calyculata, bażyna czarna Empetrum nigrum, głuszec Tetrao urogallus, modraszek bagniczek Plebejus optilete, szlaczkoń torfowiec Colias palaeno, mszarnik jutta Oeneis jutta, dostojka akwilonaris Boloria aquilonaris. Wybór gatunków zależy od obszaru.

Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX). XX tego wskaźnika nie psuje oceny struktury, bo nie jest on kardynalny.

Dlaczego: pokazuje, czy siedlisko utrzymuje gatunki, dla których jest ostoją.`,
      thresholds: {
        FV: 'Stan wszystkich takich gatunków właściwy (FV)',
        U1: 'Stan niektórych takich gatunków niezadowalający (U1)',
        U2: 'Stan niektórych takich gatunków zły (U2)',
      },
      inputs: [selectInput('Stan gatunków kluczowych', KEY_SPECIES)],
      suggest: byOption({ all: 'FV', someU1: 'U1', someU2: 'U2', noData: 'XX' }),
      describe: (i) => labelOf(KEY_SPECIES, i.choice),
    },
  ],

  prospects: {
    description:
      'Czy siedlisko utrzyma się w stanie niepogorszonym w perspektywie 10–20 lat: gospodarka leśna, zapisy planu urządzenia lasu, podejście zarządcy do wody.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu w perspektywie 10–20 lat. Zwróć uwagę na:
• gospodarkę leśną i zapisy planu urządzenia lasu dla wydzieleń z 91D0;
• podejście zarządcy do warunków wodnych – czy rowy są konserwowane, czy blokowane (zastawki);
• poprawność identyfikacji siedliska w inwentaryzacjach (np. Lasów Państwowych) – błędne rozpoznanie może skutkować niewłaściwą gospodarką.

Dlaczego: perspektywy to osobny parametr oceny ogólnej. Bór bagienny w złym stanie, ale z planowanymi zastawkami, wymaga innych decyzji niż taki, który dalej jest odwadniany.`,
    thresholds: {
      FV: 'Brak zagrożeń i negatywnych trendów. Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat jest niemal pewne',
      U1: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat nie jest pewne, ale jest prawdopodobne, o ile uda się zapobiec istniejącym zagrożeniom',
      U2: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat będzie bardzo trudne: zaawansowane procesy recesji, silne negatywne trendy lub znaczne zagrożenia',
    },
  },

  impactCodes: [
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'B02.06', name: 'Przerzedzanie drzewostanu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 7110, 7120, 7140, rzadkie gatunki, głuszec.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91D0: rzadkie i chronione gatunki, sąsiedztwo innych siedlisk (7110, 7120, 7140, 91E0), funkcja ostoi. Brak – „Nie stwierdzono”.

Dlaczego: bory bagienne zwykle tworzą kompleks z torfowiskami. Planując ochronę (np. zastawki), trzeba wiedzieć, co jeszcze się na nich odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): zastawki i progi na rowach, zasypywanie rowów, wyłączenie z użytkowania, usuwanie gatunków obcych. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Brak”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91D0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91D0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91D0(name)
    return e ? GROUP_LABELS_91D0[e.group] : undefined
  },
}

