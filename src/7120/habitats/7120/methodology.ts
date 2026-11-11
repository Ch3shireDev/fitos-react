// Metodyka 7120 jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny”,
// tom IV (GIOŚ, Biblioteka Monitoringu Środowiska), rozdział 7120, tab. 1 i 2.
// Pola `help` to rozszerzone wyjaśnienia „co wpisać i dlaczego” dla początkujących i nie tylko.
import { isIsoDate } from '../dates'
import type { FieldDef, Grade, InputValues, Methodology } from '../types'
import {
  describeSpecies,
  gradeByLowerBounds,
  gradeByUpperBounds,
  mean,
  num,
  speciesRows,
} from '../assessment'
import { GROUP_LABELS, SPECIES_7120, classify, defaultLayer, findSpecies } from './species'

const LAYERS_GROUP = 'Zwarcie i wysokość warstw A, B, C, D'

const pct = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef =>
  ({ kind: 'number', name, label, unit: '%', min: 0, max: 100, required: true, ...extra }) as FieldDef

const fmt = (n: number | undefined) => (n === undefined ? '—' : `${String(n).replace('.', ',')}%`)

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} osi transektu, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E, np. 53° 23' 19,57" N 14° 49' 24,89" E. Jeśli punkt ma oznaczenie w bazie (np. r45), dopisz je.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu za 3–6 lat. Bez dokładnych współrzędnych kolejny obserwator zbada inny fragment torfowiska i porównanie wyników straci sens. W tych samych trzech punktach (początek, środek, koniec) wykonuje się też zdjęcia fitosocjologiczne.`

// ---------- opcje selektów ----------

const PEAT_TIMING = [
  { value: 'never', label: 'Nigdy nie pozyskiwano torfu' },
  { value: 'old', label: 'Eksploatacja zakończona ponad 10 lat temu' },
  { value: 'recent', label: 'Eksploatacja w ostatnich 10 latach (lub trwa)' },
]

const PEAT_METHOD = [
  { value: '', label: '— nie dotyczy / nie wiadomo —' },
  { value: 'manual', label: 'ręczny (chałupniczy)' },
  { value: 'industrial', label: 'mechaniczny / przemysłowy' },
]

const DRAINAGE = [
  { value: 'none', label: 'Brak rowów albo infrastruktura zneutralizowana (zasypane rowy, zastawki, zamulenie)' },
  { value: 'weak', label: 'Rowy są, ale oddziałują w niewielkim stopniu (brak konserwacji, zarastanie, częściowe zastawki)' },
  { value: 'strong', label: 'Infrastruktura melioracyjna wyraźnie pogarsza warunki wodne' },
]

const AREA_TREND = [
  { value: 'toward7110', label: 'Zmniejsza się na korzyść żywych torfowisk wysokich (7110)' },
  { value: 'stable', label: 'Nie podlega zmianom' },
  { value: 'decline', label: 'Wyraźny spadek na korzyść siedlisk nietorfowych' },
]

const labelOf = (opts: { value: string; label: string }[], v: unknown) =>
  opts.find((o) => o.value === v)?.label ?? ''

const SPECIES_LIST_HELP = `Szukaj gatunku po kilku literach nazwy naukowej albo polskiej (np. „sph fal”, „żurawina”) i wybierz z listy. Każdy wybrany gatunek dostaje wiersz, w którym wpisujesz pokrycie. Gatunku spoza katalogu nie szukaj na siłę: wybierz „Dodaj własny”. Nazwy z katalogu są rozpoznawane przy liczeniu podpowiedzi oceny, własne nie.

Pokrycie podawaj w procentach całego transektu (rzut pionowy roślin na powierzchnię), z dokładnością do dziesiątek procent, a dla małych wartości do pojedynczych procent. Dla „<1%” wpisz 0,5.`

export const methodology7120: Methodology = {
  code: '7120',
  name: 'Torfowiska wysokie zdegradowane, lecz zdolne do naturalnej i stymulowanej regeneracji',
  source:
    'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, tom IV, rozdz. 7120 (tab. 1 i 2)',

  siteFields: [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      placeholder: 'np. Reptowo 2',
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska. Zwykle to nazwa torfowiska plus oznaczenie jego części, np. „Reptowo 2” albo „Baligówka I”. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku, nie wymyślaj nowej.

Dlaczego: stanowisko to jednostka, na której obserwacje powtarza się co 3–6 lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend, a nie pojedynczy stan.`,
    },
    {
      kind: 'text',
      name: 'guid',
      label: 'GUID',
      hint: 'Z bazy GIOŚ, jeśli stanowisko już istnieje. Nowe stanowisko – zostaw puste.',
      help: `Unikalny identyfikator stanowiska w bazie monitoringu GIOŚ, w formacie 8-4-4-4-12 znaków (np. 928fb2ad-4ad4-4406-8083-b8ce58f233e1). Znajdziesz go w poprzedniej karcie stanowiska albo w bazie. Dla nowego stanowiska zostaw puste – identyfikator nada baza.

Dlaczego: nazwy stanowisk się powtarzają i zmieniają, GUID nie. To on łączy Twoją kartę z historią stanowiska z poprzednich lat.`,
    },
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      hint: 'Np. Eriophoro vaginati-Sphagnetum recurvii, zbiorowisko z Calluna vulgaris, regenerujące się Sphagnetum magellanici.',
      help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi. Dla 7120 typowe są: Eriophoro vaginati-Sphagnetum recurvii, regenerujące się Sphagnetum magellanici oraz zbiorowiska „kadłubowe” bez rangi zespołu, z dominacją jednego gatunku: z wrzosem Calluna vulgaris, trzęślicą Molinia caerulea albo wełnianką pochwowatą Eriophorum vaginatum. Wszystkie należą do klasy Oxycocco-Sphagnetea albo są jej zdegradowanymi postaciami.

Dlaczego: zbiorowisko pokazuje stadium sukcesji. Zbiorowisko z trzęślicą czy wrzosem to stadium przesuszenia i degradacji, regenerujące się Sphagnetum magellanici – powrót w stronę żywego torfowiska (7110).`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 10,
      required: true,
      hint: 'Historia eksploatacji i odwodnienia, położenie transektu, co widać w terenie.',
      help: `Syntetyczny opis stanowiska w kilku zdaniach:
• historia: kiedy i jak pozyskiwano torf, kiedy wykopano rowy;
• stan obecny: uwodnienie, dominująca roślinność, zarastanie drzewami, stan warstwy mchów;
• gdzie leży transekt i czym są wyznaczone granice płatu (np. dawne pola eksploatacyjne);
• wykonane działania ochronne (zastawki, odkrzaczanie) i ich efekt.

Dlaczego: 7120 to z definicji torfowiska wysokie przekształcone przez człowieka (eksploatacja, odwodnienie), które zachowały jeszcze warstwę torfu wysokiego zdolną do regeneracji. Opis uzasadnia, że płat w ogóle jest 7120, a nie żywym torfowiskiem 7110, borem bagiennym 91D0 (zwarcie drzew powyżej 50%) albo terenem zniszczonym, z którego torf wybrano do podłoża mineralnego lub do torfu niskiego. Pozwala też następnemu obserwatorowi zrozumieć, skąd biorą się zmiany.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatu siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Powierzchnia płatu siedliska 7120 na stanowisku, w hektarach (przecinek dozwolony). To nie jest powierzchnia transektu (10×200 m = 0,2 ha) ani całego torfowiska, jeśli 7120 zajmuje tylko jego część. Najlepiej zmierz w GIS na ortofotomapie albo oszacuj z mapy.

Dlaczego: zmiana powierzchni płatu między kolejnymi obserwacjami jest podstawą oceny parametru „Powierzchnia siedliska”. Bez liczby nie ma z czym porównać.`,
    },
    {
      kind: 'textarea',
      name: 'protectedAreas',
      label: 'Obszary chronione, na których znajduje się stanowisko',
      hint: 'Z kodem obszaru Natura 2000, np. „Torfowisko Reptowo PLH320056”.',
      help: `Wszystkie formy ochrony przyrody obejmujące stanowisko: obszary Natura 2000 (nazwa i kod, np. PLH320056), rezerwaty, parki narodowe i krajobrazowe, użytki ekologiczne, zespoły przyrodniczo-krajobrazowe. Każdą formę w osobnej linii. Brak – wpisz „brak”.

Dlaczego: stan siedlisk raportuje się Komisji Europejskiej także w podziale na sieć Natura 2000, a forma ochrony decyduje, jakie działania ochronne są możliwe i kto za nie odpowiada.`,
    },
    {
      kind: 'text',
      name: 'coordStart',
      group: 'Współrzędne geograficzne',
      wide: true,
      label: 'Początek transektu',
      required: true,
      placeholder: '53° 23\' 19,572" N 14° 49\' 24,887" E',
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
      hint: 'Standard to 10×200 m.',
      help: `Faktyczne wymiary transektu. Standard metodyki to pas 10×200 m. Dozwolone są modyfikacje, gdy płat ma inny kształt albo jest mały: oś nie musi być linią prostą, transekt może być krótszy i szerszy albo mniejszy. Wtedy wpisz rzeczywiste wymiary i krótko opisz kształt.

Dlaczego: wszystkie pokrycia w karcie (%) liczy się względem powierzchni transektu. Bez znanych wymiarów procenty z różnych lat i stanowisk są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 19 albo 656–658',
      required: true,
      help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy topograficznej. Jeśli transekt ma różnicę wysokości, podaj zakres (np. 656–658 m).

Dlaczego: kontekst geograficzny. Torfowiska bałtyckie na wysokości kilkunastu metrów i torfowiska Kotliny Orawsko-Nowotarskiej (ok. 650 m) różnią się klimatem i florą, co trzeba uwzględnić przy interpretacji wyników.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 14.07.2025',
      required: true,
      hint: 'Optymalnie od lipca do połowy sierpnia.',
      help: `Dzień wykonania obserwacji w terenie. Optymalny termin dla 7120 to lipiec i pierwsza połowa sierpnia.

Dlaczego: krzewinki i torfowce da się badać przez cały sezon wegetacyjny, ale turzyce i wełnianki pewnie oznacza się dopiero w pełni lata – to one ograniczają termin badań. Obserwacje powtarza się co 3–6 lat, więc podobny termin to warunek porównywalności (w maju i we wrześniu ta sama powierzchnia wygląda zupełnie inaczej, a poziom wody też jest inny).`,
      warn: (v) => {
        if (!isIsoDate(v)) return null
        const [, m, d] = v.split('-').map(Number)
        const ok = m === 7 || (m === 8 && d <= 15)
        return ok ? null : 'Termin poza optymalnym oknem (lipiec – 15 sierpnia). Turzyce mogą być nie do oznaczenia.'
      },
    },
    {
      kind: 'text',
      name: 'observer',
      label: 'Wykonawca',
      required: true,
      help: `Imię i nazwisko osoby, która wykonała obserwację i odpowiada za dane (ekspert lokalny). Dodatkowe osoby można dopisać po przecinku.

Dlaczego: ocena stanu ochrony zawiera elementy oceny eksperckiej. Trzeba wiedzieć, kogo zapytać o uzasadnienie, gdy wyniki budzą wątpliwości.`,
    },
  ],

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne: na początku, w środku i na końcu transektu, każde 5×5 m, w skali Braun-Blanqueta. Na powierzchniach nietypowych zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: [
      {
        kind: 'text',
        name: 'coords',
        group: 'Położenie zdjęcia',
        wide: true,
        label: 'Współrzędne środka zdjęcia',
        help: `Współrzędne GPS środka powierzchni zdjęcia 5×5 m. Zdjęcia robi się na początku, w środku i na końcu transektu, więc zwykle odpowiadają punktom osi transektu.

Dlaczego: zdjęcia fitosocjologiczne powtarza się dokładnie w tych samych miejscach. To najdokładniejszy zapis zmian roślinności, jaki daje monitoring.`,
      },
      {
        kind: 'number',
        name: 'altitude',
        group: 'Położenie zdjęcia',
        label: 'Wysokość n.p.m.',
        unit: 'm n.p.m.',
        help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach, z GPS albo mapy.',
      },
      {
        kind: 'number',
        name: 'area',
        group: 'Powierzchnia, nachylenie, ekspozycja',
        label: 'Powierzchnia zdjęcia',
        unit: 'm²',
        min: 0,
        defaultValue: 25,
        help: `Powierzchnia zdjęcia w m². Standard metodyki to kwadrat 5×5 m = 25 m². Zmieniaj tylko wtedy, gdy płat jest za mały, i wpisz faktyczną wartość.

Dlaczego: liczba gatunków rośnie wraz z powierzchnią. Zdjęcia o różnej wielkości nie są porównywalne.`,
      },
      {
        kind: 'number',
        name: 'slope',
        group: 'Powierzchnia, nachylenie, ekspozycja',
        label: 'Nachylenie',
        unit: '°',
        min: 0,
        max: 90,
        help: `Nachylenie powierzchni w stopniach (klinometr albo kompas z klinometrem). Torfowiska są zwykle płaskie, więc najczęściej wpiszesz 0–2°. Większe wartości spotyka się na skarpach poeksploatacyjnych i zboczach kopuły.

Dlaczego: na nachylonych fragmentach woda szybciej odpływa, więc są bardziej narażone na przesuszenie.`,
      },
      {
        kind: 'text',
        name: 'exposure',
        group: 'Powierzchnia, nachylenie, ekspozycja',
        label: 'Ekspozycja',
        placeholder: 'np. S albo „brak”',
        help: `Kierunek, w którym opada powierzchnia (N, NE, E, SE, S, SW, W, NW), określony kompasem. Dla powierzchni płaskiej wpisz „brak”.

Dlaczego: ekspozycja wpływa na nasłonecznienie i parowanie. Skarpy o wystawie południowej przesychają najszybciej.`,
      },
      pct('coverA', 'Zwarcie A', {
        required: false,
        group: LAYERS_GROUP,
        groupCols: 4,
        help: `Warstwa A – drzewa. Procent powierzchni zdjęcia przykryty koronami drzew (warstwa A, zwykle powyżej ok. 4–5 m), w rzucie pionowym. Brak drzew = 0.

Dlaczego: zwarcie drzew powyżej 50% oznacza, że płat jest już borem bagiennym (91D0), a nie siedliskiem 7120.`,
      }),
      pct('coverB', 'Zwarcie B', {
        required: false,
        group: LAYERS_GROUP,
        help: `Warstwa B – krzewy i podrost. Procent powierzchni zdjęcia przykryty przez krzewy i podrost drzew (warstwa B): młode sosny i brzozy, kruszyna, wierzby.

Dlaczego: warstwa B to pierwszy sygnał zarastania torfowiska lasem, zwykle skutek przesuszenia. Drzewa dodatkowo osuszają torf przez transpirację.`,
      }),
      pct('coverC', 'Zwarcie C', {
        required: false,
        group: LAYERS_GROUP,
        help: `Warstwa C – zielna i krzewinki. Procent powierzchni zdjęcia przykryty przez rośliny zielne i krzewinki (warstwa C): wrzos, bagno, żurawina, wełnianki, turzyce, trzęślica, siewki drzew.

Dlaczego: w tej warstwie najlepiej widać kierunek zmian: ekspansję trzęślicy i wrzosu (przesuszenie) albo powrót gatunków torfowiskowych.`,
      }),
      pct('coverD', 'Zwarcie D', {
        required: false,
        group: LAYERS_GROUP,
        help: `Warstwa D – mszysta. Procent powierzchni zdjęcia przykryty przez mszaki i porosty naziemne (warstwa D): torfowce, inne mchy, wątrobowce, chrobotki.

Dlaczego: torfowce budują torf, więc pokrycie i skład warstwy D to najczulszy wskaźnik stanu torfowiska. Spadek pokrycia torfowców to wczesny sygnał degradacji.`,
      }),
      {
        kind: 'number',
        name: 'heightA',
        group: LAYERS_GROUP,
        label: 'Wysokość A',
        unit: 'm',
        min: 0,
        placeholder: 'np. 12',
        help: `Warstwa A – drzewa. Typowa (przeciętna) wysokość warstwy, w metrach. Brak warstwy = 0.

Dlaczego: wysokość warstw opisuje strukturę roślinności. Wysoka, zwarta trzęślica lub wrzos zacieniają torfowce, a rosnąca warstwa B zapowiada zarastanie lasem.`,
      },
      {
        kind: 'number',
        name: 'heightB',
        group: LAYERS_GROUP,
        label: 'Wysokość B',
        unit: 'm',
        min: 0,
        placeholder: 'np. 1,5',
        help: `Warstwa B – krzewy i podrost. Typowa (przeciętna) wysokość warstwy, w metrach. Brak warstwy = 0.

Dlaczego: wysokość warstw opisuje strukturę roślinności. Wysoka, zwarta trzęślica lub wrzos zacieniają torfowce, a rosnąca warstwa B zapowiada zarastanie lasem.`,
      },
      {
        kind: 'number',
        name: 'heightC',
        group: LAYERS_GROUP,
        label: 'Wysokość C',
        unit: 'cm',
        min: 0,
        placeholder: 'np. 30',
        help: `Warstwa C – zielna i krzewinki. Typowa (przeciętna) wysokość warstwy, w centymetrach. Brak warstwy = 0.

Dlaczego: wysokość warstw opisuje strukturę roślinności. Wysoka, zwarta trzęślica lub wrzos zacieniają torfowce, a rosnąca warstwa B zapowiada zarastanie lasem.`,
      },
      {
        kind: 'number',
        name: 'heightD',
        group: LAYERS_GROUP,
        label: 'Wysokość D',
        unit: 'cm',
        min: 0,
        placeholder: 'np. 4',
        help: `Warstwa D – mszysta. Typowa (przeciętna) wysokość warstwy, w centymetrach. Brak warstwy = 0.

Dlaczego: wysokość warstw opisuje strukturę roślinności. Wysoka, zwarta trzęślica lub wrzos zacieniają torfowce, a rosnąca warstwa B zapowiada zarastanie lasem.`,
      },
      {
        kind: 'text',
        name: 'unit',
        label: 'Jednostka fitosocjologiczna',
        help: `Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Sphagnetum magellanici (stadium regeneracyjne)” albo „zbiorowisko z Calluna vulgaris”.

Dlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy płat przechodzi w inne zbiorowisko.`,
      },
      {
        kind: 'releve-species',
        name: 'species',
        label: 'Skład gatunkowy wg warstw',
        help: `Wszystkie gatunki stwierdzone na powierzchni zdjęcia. Dla każdego wybierasz warstwę (A – drzewa, B – krzewy i podrost, C – zielna i krzewinki, D – mszysta) oraz ilościowość w skali Braun-Blanqueta:
• r – pojedynczy osobnik,
• + – nieliczne osobniki, pokrycie znikome,
• 1 – liczne, ale pokrycie poniżej 5%,
• 2 – pokrycie 5–25%,
• 3 – pokrycie 25–50%,
• 4 – pokrycie 50–75%,
• 5 – pokrycie 75–100%.

Warstwa podpowiada się sama po wyborze gatunku (mchy do D, drzewa do B), ale możesz ją zmienić. Ten sam gatunek może wystąpić w dwóch warstwach, np. sosna w B i jej siewki w C – dodaj go wtedy dwa razy.

Dlaczego: skala Braun-Blanqueta to standard europejskiej fitosocjologii. Pozwala porównywać zdjęcia między latami i z literaturą, a zapis z podziałem na warstwy pokazuje strukturę płatu.`,
      },
    ],
  },

  indicators: [
    {
      id: 'area',
      label: 'Powierzchnia siedliska na stanowisku',
      parameter: 'area',
      description:
        'Zmiana powierzchni siedliska względem wcześniejszych badań. Uwaga, pułapka: dla 7120 ubytek na rzecz żywego torfowiska 7110 to sukces, nie strata.',
      help: `Co wybrać: jak zmieniła się powierzchnia płatu 7120 od poprzedniej obserwacji (albo względem danych archiwalnych, map, ortofotomap).

Uwaga na nietypową logikę. Celem ochrony 7120 nie jest utrzymanie siedliska 7120, tylko jego powrót do żywego torfowiska wysokiego 7110. Dlatego:
• ubytek 7120, bo płaty zregenerowały się do 7110 – to sukces (FV);
• brak zmian – U1, bo siedlisko trwa w stanie zdegradowanym;
• ubytek 7120 na rzecz siedlisk nietorfowych (las, łąka, nieużytek) – U2.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Zmniejsza się na korzyść żywych torfowisk wysokich',
        U1: 'Nie podlega zmianom',
        U2: 'Wyraźny spadek (na korzyść siedlisk nietorfowych) w porównaniu z wcześniejszymi badaniami',
      },
      inputs: [
        {
          kind: 'select',
          name: 'trend',
          label: 'Jak zmienia się powierzchnia?',
          options: AREA_TREND,
          required: true,
          help: 'Wybierz kierunek zmiany powierzchni płatu 7120. Pełne wyjaśnienie logiki ocen jest pod „?” przy nazwie wskaźnika.',
        },
      ],
      suggest: (i) => ({ toward7110: 'FV', stable: 'U1', decline: 'U2' } as Record<string, Grade>)[String(i.trend)] ?? null,
      describe: (i) => labelOf(AREA_TREND, i.trend),
    },
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne torfowisk wysokich',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki roślin naczyniowych i mchów charakterystyczne dla klasy Oxycocco-Sphagnetea z pokryciem transektu. Pokazuje udział gatunków wysokotorfowiskowych w obecnych stadiach sukcesyjnych.',
      help: `Co wpisać: wszystkie gatunki charakterystyczne dla klasy Oxycocco-Sphagnetea (zbiorowiska torfowisk wysokich) stwierdzone na transekcie, każdy z pokryciem całego transektu w %.

Liczą się dwie grupy:
• torfowce – kępkowe (S. magellanicum, S. rubellum, S. capillifolium, S. fuscum, S. papillosum) i dolinkowe (S. cuspidatum, S. fallax, S. angustifolium),
• rośliny naczyniowe – m.in. modrzewnica Andromeda polifolia, rosiczka okrągłolistna Drosera rotundifolia, żurawina błotna Oxycoccus palustris, turzyca skąpokwiatowa Carex pauciflora, wełnianka pochwowata Eriophorum vaginatum.

Formularz sam liczy torfowce i rośliny naczyniowe z listy i porównuje z progami (FV: co najmniej 2 + 2, U1: co najmniej 1 + 1).

Dlaczego: gatunki charakterystyczne to „materiał” do regeneracji – źródło diaspor i zalążek zbiorowiska torfotwórczego. Bez torfowców powrót do żywego torfowiska 7110 jest praktycznie niemożliwy. Dlatego to wskaźnik kardynalny: jego U2 przesądza o U2 całego parametru „specyficzna struktura i funkcje”.`,
      thresholds: {
        FV: 'Co najmniej 2 gatunki torfowców i co najmniej 2 gatunki roślin naczyniowych charakterystycznych dla Oxycocco-Sphagnetea',
        U1: 'Co najmniej 1 gatunek torfowca i co najmniej 1 gatunek rośliny naczyniowej charakterystycznej',
        U2: 'Brak charakterystycznych torfowców, najwyżej 1 gatunek charakterystycznej rośliny naczyniowej',
      },
      inputs: [
        {
          kind: 'species',
          name: 'species',
          label: 'Gatunki charakterystyczne na transekcie',
          required: true,
          help: SPECIES_LIST_HELP,
        },
      ],
      suggest: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const c = classify(rows)
        if (c.charSphagnum.length >= 2 && c.charVascular.length >= 2) return 'FV'
        if (c.charSphagnum.length >= 1 && c.charVascular.length >= 1) return 'U1'
        return 'U2'
      },
      explain: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const c = classify(rows)
        const parts = [
          `Torfowce charakterystyczne: ${c.charSphagnum.length}${c.charSphagnum.length ? ` (${c.charSphagnum.join(', ')})` : ''}.`,
          `Naczyniowe charakterystyczne: ${c.charVascular.length}${c.charVascular.length ? ` (${c.charVascular.join(', ')})` : ''}.`,
        ]
        if (c.unknown.length) parts.push(`Nie rozpoznano: ${c.unknown.join(', ')} – nie liczę ich.`)
        return parts.join(' ')
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'dominant',
      label: 'Gatunki dominujące',
      parameter: 'structure',
      description:
        'Gatunki o największej ilościowości w swoich warstwach i ich udział procentowy. Odpowiada na pytanie, czy dominują gatunki torfowiskowe.',
      help: `Co wpisać: gatunki osiągające największe pokrycie w swojej warstwie (dominanty), zwykle 2–4 gatunki, każdy z pokryciem transektu w %. Gdy nic wyraźnie nie dominuje albo pokrycie jest bardzo małe, wpisz gatunki najliczniejsze.

Formularz liczy, jaką część łącznego pokrycia dominantów stanowią gatunki wysokotorfowiskowe (charakterystyczne dla Oxycocco-Sphagnetea i typowe dla torfowisk, np. bagno, borówka bagienna). Przewodnik nie podaje liczby dla „mniej więcej równego” udziału, więc jako próg FV przyjęto 45% – to interpretacja, nie norma.

Dlaczego: struktura dominacji mówi, czy zbiorowisko jest jeszcze torfowiskowe. Dominacja trzęślicy, brzozy czy trzciny oznacza zbiorowisko „ekologicznie obce”, powstałe wskutek przesuszenia i mineralizacji torfu.`,
      thresholds: {
        FV: 'Dominują gatunki charakterystyczne dla torfowisk wysokich, lub ich udział jest mniej więcej równy gatunkom ekologicznie obcym',
        U1: 'Dominują gatunki ekologicznie obce, udział gatunków wysokotorfowiskowych co najmniej 20%',
        U2: 'Dominują gatunki ekologicznie obce, udział gatunków wysokotorfowiskowych poniżej 20%',
      },
      inputs: [{ kind: 'species', name: 'species', label: 'Gatunki dominujące', required: true, help: SPECIES_LIST_HELP }],
      suggest: (i) => gradeByLowerBounds(classify(speciesRows(i.species)).peatShare, 45, 20),
      explain: (i) => {
        const c = classify(speciesRows(i.species))
        if (c.peatShare === undefined) return null
        return `Udział gatunków wysokotorfowiskowych wśród dominantów: ${c.peatShare}%. Próg FV przyjęto na 45% („mniej więcej równy”) – to interpretacja, przewodnik liczby nie podaje.${c.unknown.length ? ` Nierozpoznane (liczone jako obce): ${c.unknown.join(', ')}.` : ''}`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'mosses',
      label: 'Pokrycie i struktura gatunkowa mchów',
      parameter: 'structure',
      cardinal: true,
      description:
        'Procent transektu zajęty przez mchy oraz udział torfowców kępkowych w powierzchni mchów. Zanik torfowców to sygnał alarmowy.',
      help: `Co wpisać:
1. Jaki procent transektu pokrywają łącznie wszystkie mchy – torfowce i inne mchy (np. płonnik, rokietnik).
2. Jaką część tej powierzchni mchów zajmują torfowce kępkowe: S. magellanicum, S. rubellum, S. capillifolium, S. fuscum, S. papillosum.

Przykład: mchy pokrywają 40% transektu, z czego połowę zajmują torfowce kępkowe – wpisujesz 40 i 50. W polu opisu podaj też, które gatunki dominują w warstwie mchów i jaki jest udział torfowców w ogóle.

Dlaczego: torfowce kępkowe budują torf wysoki i rosną tylko przy stałym, wysokim poziomie wody. Gdy lustro wody opada i się waha, najpierw znikają kępkowe, potem torfowce w ogóle, a ich miejsce zajmują mchy leśne. Dlatego ten wskaźnik reaguje na odwodnienie najwcześniej i jest kardynalny. Torfowce dolinkowe (S. cuspidatum, S. fallax) świadczą o wilgotnych obniżeniach, ale nie budują kopuły torfowiska – stąd próg liczony tylko z kępkowych.`,
      thresholds: {
        FV: 'Mchy ponad 50%, a torfowce kępkowe ponad 25% powierzchni zajmowanej przez mchy',
        U1: 'Mchy 20–50% lub torfowce kępkowe 1–25% powierzchni zajmowanej przez mchy',
        U2: 'Mchy poniżej 20% lub torfowce kępkowe nie występują',
      },
      inputs: [
        pct('mossCover', 'Całkowite pokrycie mchów na transekcie', {
          help: 'Suma pokrycia wszystkich mszaków (torfowce i inne mchy) w % powierzchni transektu. Porosty (chrobotki) nie wliczaj.',
        }),
        pct('hummockShare', 'Udział torfowców kępkowych w powierzchni mchów', {
          hint: 'Ile procent powierzchni mchów zajmują torfowce kępkowe. Brak = 0.',
          help: 'Uwaga: to procent powierzchni zajętej przez mchy, nie całego transektu. Jeśli mchy pokrywają 20% transektu, a torfowce kępkowe 5% transektu, wpisz 25 (5 z 20).',
        }),
      ],
      suggest: (i) => {
        const moss = num(i.mossCover)
        const hummock = num(i.hummockShare)
        if (moss === undefined || hummock === undefined) return null
        if (moss < 20 || hummock === 0) return 'U2'
        if (moss > 50 && hummock > 25) return 'FV'
        return 'U1'
      },
      describe: (i) => `Mszaki – ${fmt(num(i.mossCover))}, torfowce kępkowe – ${fmt(num(i.hummockShare))} powierzchni mchów`,
    },
    {
      id: 'invasive',
      label: 'Obce gatunki inwazyjne',
      parameter: 'structure',
      description: 'Gatunki obce geograficznie na transekcie i ich pokrycie. Opisuje stopień przekształcenia siedliska.',
      help: `Co wpisać: łączne pokrycie transektu przez gatunki obce geograficznie (inwazyjne), np. czeremchę amerykańską Prunus serotina czy dąb czerwony Quercus rubra. W polu opisu wymień gatunki z pokryciem. Brak – wpisz 0, pojedyncze osobniki – 0,5.

Nie wpisuj tu gatunków rodzimych, nawet jeśli są ekspansywne (trzęślica, wrzos, brzoza) – mają własne wskaźniki.

Dlaczego: gatunki obce pojawiają się na torfowisku zwykle dopiero po silnym przesuszeniu i mineralizacji torfu, gdy siedlisko przestaje być skrajnie ubogie i kwaśne. Ich obecność to miara głębokiego przekształcenia.`,
      thresholds: { FV: 'Brak lub pojedyncze', U1: 'Zajmują do 20% powierzchni', U2: 'Zajmują powyżej 20% powierzchni' },
      inputs: [pct('cover', 'Łączne pokrycie gatunków inwazyjnych', {
          hint: 'Brak = 0, pojedyncze osobniki = 0,5.',
          help: 'Suma pokrycia wszystkich gatunków obcych geograficznie w % transektu. Pojedyncze osobniki (np. jedna siewka czeremchy) wpisz jako 0,5 – wtedy ocena to wciąż FV („brak lub pojedyncze”).',
        })],
      suggest: (i) => {
        const v = num(i.cover)
        if (v === undefined) return null
        return v < 1 ? 'FV' : v <= 20 ? 'U1' : 'U2'
      },
      describe: (i) => (num(i.cover) === 0 ? 'Brak' : `Łączne pokrycie ${fmt(num(i.cover))}`),
    },
    {
      id: 'expansive',
      label: 'Gatunki ekspansywne roślin zielnych',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki ekspansywne i ich pokrycie. Klasyk to trzęślica modra Molinia caerulea, na wielu torfowiskach także wrzos Calluna vulgaris.',
      help: `Co wpisać: łączne pokrycie transektu przez rodzime gatunki zielne i krzewinki, które rozprzestrzeniają się kosztem roślinności torfowiskowej. Najczęściej to trzęślica modra Molinia caerulea, na wielu zdegradowanych torfowiskach wrzos Calluna vulgaris, lokalnie trzcina pospolita. W polu opisu wymień gatunki z pokryciem.

Dlaczego: gdy poziom wody spada, torf się napowietrza i murszeje, uwalniając składniki pokarmowe. Trzęślica i wrzos to wykorzystują i wypierają gatunki torfowiskowe, a gęsta darń trzęślicy dodatkowo zacienia torfowce. Ich pokrycie mówi więc, jak daleko zaszło przesuszenie i w którą stronę idzie sukcesja. Wskaźnik kardynalny.`,
      thresholds: { FV: 'Zajmują do 25% powierzchni', U1: 'Zajmują 26–75% powierzchni', U2: 'Zajmują powyżej 75% powierzchni' },
      inputs: [pct('cover', 'Łączne pokrycie gatunków ekspansywnych', {
          help: 'Suma pokrycia wszystkich rodzimych gatunków ekspansywnych (trzęślica, wrzos, trzcina…) w % transektu. Jeśli trzęślica ma 40%, a wrzos 15%, wpisz 55. Pełne wyjaśnienie pod „?” przy nazwie wskaźnika.',
        })],
      suggest: (i) => gradeByUpperBounds(num(i.cover), 25, 75),
      describe: (i) => `Łączne pokrycie ${fmt(num(i.cover))}`,
    },
    {
      id: 'woody',
      label: 'Obecność krzewów i podrostu drzew',
      parameter: 'structure',
      description:
        'Drzewa i krzewy (z juwenilnymi) na transekcie, pokrycie każdego gatunku i sumaryczne. Opisuje zagrożenie zarośnięciem przez formacje leśne.',
      help: `Co wpisać: łączne pokrycie transektu przez drzewa i krzewy, łącznie z młodymi osobnikami (siewki, podrost). W polu opisu podaj każdy gatunek z pokryciem: sosna, brzoza brodawkowata i omszona, kruszyna, świerk, wierzby.

Dlaczego: zarastanie lasem to typowy skutek odwodnienia. Drzewa dodatkowo osuszają torf przez transpirację, zacieniają torfowce i przyspieszają przemianę torfowiska w bór. Przy zwarciu drzew powyżej 50% płat traktuje się już jako bór bagienny (91D0), a nie 7120 – wtedy sprawdź wyznaczenie stanowiska.`,
      thresholds: {
        FV: 'Łączne pokrycie do 10%',
        U1: 'Łączne pokrycie 11–30%',
        U2: 'Łączne pokrycie 31–60% (płaty o zwarciu drzew powyżej 50% to już bór bagienny)',
      },
      inputs: [pct('cover', 'Łączne pokrycie drzew i krzewów', {
          help: 'Pokrycie wszystkich drzew i krzewów razem (z podrostem i siewkami) w rzucie pionowym, w % transektu. Korony nakładające się na siebie liczy się raz – dlatego to nie musi być suma pokryć gatunków.',
        })],
      suggest: (i) => gradeByUpperBounds(num(i.cover), 10, 30),
      warn: (i) => {
        const v = num(i.cover)
        return v !== undefined && v > 50
          ? 'Zwarcie drzew powyżej 50% – to już raczej bór bagienny (91D0), nie 7120. Sprawdź wyznaczenie stanowiska.'
          : null
      },
      describe: (i) => `Ogólne pokrycie drzew i krzewów ${fmt(num(i.cover))}`,
    },
    {
      id: 'wellDeveloped',
      label: 'Udział dobrze wykształconych płatów siedliska',
      parameter: 'structure',
      description:
        'Procent transektu z dobrze wykształconymi płatami: roślinność typowa dla torfowisk wysokich, gatunki charakterystyczne, pełne pokrycie i prawidłowa struktura warstwy mchów.',
      help: `Co wpisać: szacowany procent transektu zajęty przez płaty, które wyglądają jak żywe torfowisko wysokie: są w nich gatunki charakterystyczne Oxycocco-Sphagnetea, warstwa mchów jest zwarta i zbudowana głównie z torfowców, nie dominują trzęślica, wrzos ani drzewa. Brak takich płatów – wpisz 0.

Dlaczego: to bezpośrednia miara tego, ile siedliska ma już właściwą strukturę, czyli jak daleko zaszła regeneracja. Dobrze wykształcone płaty to ośrodki, z których mszar może się rozprzestrzeniać po poprawie warunków wodnych.`,
      thresholds: {
        FV: 'Co najmniej 25%',
        U1: '1–25%',
        U2: 'Brak dobrze wykształconych płatów',
      },
      inputs: [pct('share', 'Udział dobrze wykształconych płatów na transekcie', {
          help: 'Procent długości/powierzchni transektu, na którym roślinność wygląda jak na żywym torfowisku (torfowce, gatunki charakterystyczne, brak dominacji trzęślicy i drzew). Brak – 0.',
        })],
      suggest: (i) => {
        const v = num(i.share)
        if (v === undefined) return null
        return v >= 25 ? 'FV' : v > 0 ? 'U1' : 'U2'
      },
      describe: (i) => fmt(num(i.share)),
    },
    {
      id: 'hydration',
      label: 'Stopień uwodnienia',
      parameter: 'structure',
      description:
        'Głębokość zalegania wody gruntowej (latem) względem powierzchni torfowiska. Najlepiej z piezometru, w praktyce – dołek i łopatka.',
      help: `Co wpisać: głębokość lustra wody poniżej powierzchni torfowiska, w cm, w 5 punktach co 50 m wzdłuż transektu (3 w miejscach zdjęć fitosocjologicznych, 2 pomiędzy nimi).

Jak mierzyć bez specjalistycznego sprzętu: wykop łopatką dołek, odczekaj kilka–kilkanaście minut, aż woda się ustabilizuje, i zmierz taśmą, jak głęboko stoi. Woda nad powierzchnią – wpisz liczbę ujemną. Jeśli na stanowisku są piezometry, użyj ich odczytu. Mierz latem, kiedy stany wody są najniższe.

Formularz liczy średnią z pomiarów i porównuje z progami (FV: do 20 cm, U1: 20–40 cm, U2: ponad 40 cm).

Dlaczego: woda decyduje o wszystkim na torfowisku. Torfowce i proces torfotwórczy wymagają lustra wody stale przy powierzchni. Gdy woda opada poniżej ok. 40 cm, torf się napowietrza, mineralizuje (murszeje) i osiada, a roślinność przechodzi w trzęślicę, wrzos i las.`,
      thresholds: {
        FV: 'Woda równo lub do 20 cm poniżej powierzchni (przy chodzeniu woda widoczna co najmniej do podeszwy)',
        U1: 'Woda 20–40 cm poniżej powierzchni',
        U2: 'Woda ponad 40 cm poniżej powierzchni',
      },
      inputs: [1, 2, 3, 4, 5].map(
        (n): FieldDef => ({
          kind: 'number',
          name: `depth${n}`,
          label: `Pomiar ${n}`,
          unit: 'cm',
          min: -100,
          max: 300,
          help:
            n === 1 || n === 3 || n === 5
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi. Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.',
        }),
      ),
      suggest: (i) => gradeByUpperBounds(meanDepth(i), 20, 40),
      explain: (i) => {
        const m = meanDepth(i)
        return m === undefined ? null : `Średnia z pomiarów: ${String(Math.round(m * 10) / 10).replace('.', ',')} cm poniżej powierzchni.`
      },
      describe: (i) => {
        const vals = depths(i)
        return vals.length ? `Poziom wody: ${vals.join(', ')} cm poniżej powierzchni torfowiska` : ''
      },
    },
    {
      id: 'peat',
      label: 'Pozyskanie torfu',
      parameter: 'structure',
      description: 'Ślady eksploatacji: sposób wydobycia, skala, przedział czasowy. Określa dewastację spowodowaną wydobyciem.',
      help: `Co wybrać i opisać: kiedy ostatnio wydobywano torf na stanowisku i w jaki sposób. Ślady eksploatacji to doły potorfowe, schodkowe ściany torfu, regularne prostokątne pola, kopce, pozostałości torowisk i dróg.
• Sposób ręczny (chałupniczy) zostawia płytkie, nieregularne doły.
• Sposób przemysłowy (mechaniczny) zostawia duże, regularne pola, często frezowane.

W polu opisu podaj skalę (szacunek rocznego wydobycia w m³ albo procent zniszczonej powierzchni) i przedział czasowy wydobycia.

Dlaczego: eksploatacja usuwa żywą, górną warstwę torfowiska i część torfu pod nią. Im świeższa i głębsza, tym mniej czasu minęło na samoistną regenerację i tym mniejsze na nią szanse. Jeśli torf wybrano do podłoża albo do torfu niskiego, to już nie jest siedlisko 7120.`,
      thresholds: {
        FV: 'Brak pozyskania torfu kiedykolwiek w przeszłości',
        U1: 'Eksploatacja prowadzona dawniej niż 10 lat temu',
        U2: 'Eksploatacja prowadzona w ostatnich latach, do 10 lat temu',
      },
      inputs: [
        {
          kind: 'select',
          name: 'timing',
          label: 'Kiedy pozyskiwano torf?',
          options: PEAT_TIMING,
          required: true,
          help: 'Liczy się ostatnia eksploatacja na stanowisku. Eksploatacja tuż za granicą stanowiska, która je odwadnia, to oddziaływanie – wpisz ją w zakładce „Oddziaływania”.',
        },
        {
          kind: 'select',
          name: 'method',
          label: 'Sposób pozyskania',
          options: PEAT_METHOD,
          help: 'Ręczny: płytkie, nieregularne doły, zwykle mała skala. Mechaniczny/przemysłowy: duże, regularne pola, maszyny, często torowiska. Nie da się ustalić – zostaw „nie dotyczy / nie wiadomo”.',
        },
      ],
      suggest: (i) => ({ never: 'FV', old: 'U1', recent: 'U2' } as Record<string, Grade>)[String(i.timing)] ?? null,
      describe: (i) => [labelOf(PEAT_TIMING, i.timing), i.method ? `sposób: ${labelOf(PEAT_METHOD, i.method)}` : ''].filter(Boolean).join(', '),
    },
    {
      id: 'drainage',
      label: 'Melioracje odwadniające',
      parameter: 'structure',
      description:
        'Infrastruktura melioracyjna, jej stan i wpływ na warunki wodne: rowy, ich głębokość, poziom wody, czy woda odpływa czy stagnuje.',
      help: `Co wybrać i opisać: czy na stanowisku i w jego otoczeniu są rowy melioracyjne albo inne urządzenia odwadniające. W polu opisu podaj:
• głębokość rowów i poziom wody w nich,
• czy woda odpływa (rów czynny), czy stagnuje,
• stan techniczny: konserwowane, zarastające, zamulone, częściowo zasypane,
• czy są zastawki albo zasypania i czy działają.

Dlaczego: sieć rowów to główny mechanizm degradacji torfowisk 7120. Rów obniża lustro wody na dużym obszarze, także daleko od swojego koryta. Zneutralizowanie rowów (zastawki, zasypywanie) to podstawowe działanie ochronne, więc stan melioracji mówi też, czy regeneracja jest w ogóle możliwa.`,
      thresholds: {
        FV: 'Brak sieci rowów albo infrastruktura „zneutralizowana” (zasypane rowy, zastawki, naturalne zarastanie, zamulanie)',
        U1: 'Sieć rowów oddziałuje w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, zarastanie, zastawki)',
        U2: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne',
      },
      inputs: [
        {
          kind: 'select',
          name: 'state',
          label: 'Stan melioracji',
          options: DRAINAGE,
          required: true,
          help: 'Oceniasz wpływ na warunki wodne, nie samą obecność rowów. Zarośnięty, zamulony rów bez przepływu może oddziaływać słabo; płytki, ale czynny rów w środku kopuły – silnie.',
        },
      ],
      suggest: (i) => ({ none: 'FV', weak: 'U1', strong: 'U2' } as Record<string, Grade>)[String(i.state)] ?? null,
    },
  ],

  prospects: {
    description:
      'Realne możliwości poprawy stanu, aż do odtworzenia 7110, albo przynajmniej utrzymania obecnego. Opisz wykonane i potencjalne zabiegi ochronne oraz co się stanie bez renaturyzacji.',
    help: `Co wpisać: ekspercką ocenę, czy siedlisko ma realną szansę poprawić się (aż do odtworzenia żywego torfowiska 7110) albo przynajmniej się nie pogorszyć w najbliższych latach. Weź pod uwagę zagrożenia oraz działania ochronne – wykonane, planowane i możliwe (zastawki, zasypanie rowów, usuwanie nalotu drzew). Odpowiedz też na pytanie: co się stanie, jeśli nic nie zostanie zrobione?

Dlaczego: 7120 nie jest stanem docelowym. Bez neutralizacji odwodnienia zwykle degraduje się dalej. Perspektywy to osobny parametr oceny ogólnej – siedlisko w złym stanie, ale z dobrymi perspektywami, wymaga innych decyzji niż takie, którego nie da się uratować.`,
    thresholds: {
      FV: 'Dobre perspektywy poprawy stanu torfowiska, aż do odtworzenia w przyszłości siedliska 7110',
      U1: 'Dobre perspektywy na zachowanie siedliska w stanie niepogorszonym',
      U2: 'Perspektywy złe, silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie',
    },
  },

  impactCodes: [
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: [
    {
      kind: 'textarea',
      name: 'otherValues',
      label: 'Inne wartości przyrodnicze',
      hint: 'Np. sąsiedztwo 7110, 7140, 7150, 91D0, rzadkie gatunki.',
      help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 7120: rzadkie i chronione gatunki roślin i zwierząt, sąsiedztwo innych siedlisk (7110, 7140, 7150, 91D0), funkcja ostoi. Brak – „Nie stwierdzono”.

Dlaczego: torfowiska zdegradowane zwykle tworzą kompleks z innymi siedliskami. Planując działania ochronne (np. podniesienie poziomu wody), trzeba wiedzieć, co jeszcze się na nich odbije.`,
    },
    {
      kind: 'textarea',
      name: 'conservation',
      label: 'Wykonywane zabiegi ochronne i ocena ich skuteczności',
      help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): zastawki, zasypanie rowów, usuwanie nalotu drzew, odkrzaczanie. Do tego ocena skuteczności poparta obserwacjami, np. „po budowie zastawek w 2005 r. rozwój mszarów, od 2016 r. spadek poziomu wody”. Brak działań – „Brak”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów (albo braku efektów) zabiegów.`,
    },
    {
      kind: 'textarea',
      name: 'notes',
      label: 'Uwagi',
      help: 'Wszystko, co nie zmieściło się gdzie indziej: problemy z dostępem, nietypowe warunki w dniu obserwacji (np. po ulewie, po długiej suszy), wątpliwości co do oznaczeń, uwagi metodyczne dla następnego obserwatora.',
    },
    {
      kind: 'photos',
      name: 'photos',
      label: 'Dokumentacja fotograficzna',
      help: `Wgraj zdjęcia przyciskiem „Dodaj zdjęcia” albo przeciągnij pliki na pole. Każde dostaje podpis „Fot. N.” – dopisz, co przedstawia, i autora, np. „Fot. 1. Widok ogólny na stanowisko (fot. J. Kowalski)”. Najlepiej zdjęcia z punktów początku, środka i końca transektu, w tym samym kierunku co poprzednio.

Zdjęcia są zmniejszane do 1600 px i zapisywane razem z kartą (w pliku JSON). Pozycja bez pliku (sam podpis) też jest dozwolona – np. gdy zdjęcia leżą w osobnym archiwum.

Dlaczego: zdjęcia z tych samych punktów to najprostszy sposób, żeby za kilka lat zobaczyć zmianę bez czytania tabel.`,
    },
  ],

  speciesCatalog: SPECIES_7120.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer(s) })),
  speciesInfo: (name) => {
    const e = findSpecies(name)
    return e ? GROUP_LABELS[e.group] : undefined
  },
}

function depths(i: InputValues): number[] {
  return [1, 2, 3, 4, 5].map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)
}

function meanDepth(i: InputValues): number | undefined {
  return mean(depths(i))
}
