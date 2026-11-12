// Metodyka *91E0 jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. I”
// (GIOŚ 2010, red. W. Mróz), rozdz. 91E0 Łęgi wierzbowe, topolowe, olszowe i jesionowe, tab. 1 i 2,
// z modyfikacjami GIOŚ z 2012-07-31 (martwe drewno: nowe progi, grube drewno kardynalne)
// i 2015-07-17 (w podtypach 91E0-6 i 91E0-7 martwe drewno i wiek drzewostanu nie liczą się do oceny).
// Silnik formularza i ocen leży w src/7120, wspólne wskaźniki leśne w src/forest – tu są tylko dane i różnice 91E0.
import type { FieldDef, Grade, IndicatorContext, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  byOption,
  choiceIndicator,
  deadWoodCount,
  dominantSpecies,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  geoAlienTrees,
  gradeMap,
  invasiveAliens,
  keySpecies,
  labelOf,
  loggingDamage,
  naturalRegeneration,
  otherDistortions,
  pct,
  plNum,
  selectInput,
  speciesInput,
  standAge,
  verticalStructure,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_91E0,
  SPECIES_91E0,
  SUBTYPES_91E0,
  defaultLayer91E0,
  findSpecies91E0,
  isMountainAlder,
  subtypeOf,
  typicalMatch,
  type Subtype91E0,
} from './species'

const MOUNTAIN_NOTE =
  'Modyfikacja metodyki z 2015 r.: na stanowiskach podtypów 91E0-6 (nadrzeczna olszyna górska) i 91E0-7 (bagienna olszyna górska) wskaźnik ma charakter pomocniczy – trzeba go zbadać i wpisać, ale nie bierze się go pod uwagę w ocenie parametru „specyficzna struktura i funkcje”. Formularz pomija go wtedy w wyliczeniu.'

/** Wskaźnik wyłączony z oceny struktury w górskich olszynkach (91E0-6, 91E0-7). */
const mountainExcluded = (ctx: IndicatorContext) => isMountainAlder(ctx.site)

const mountainExplain = (ctx?: IndicatorContext) =>
  isMountainAlder(ctx?.site) ? `Podtyp ${subtypeOf(ctx?.site)}: wskaźnik nie liczy się do oceny struktury (modyfikacja 2015).` : null

const joinExplain = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ') || null

// ---------- podtyp ----------

export const SUBTYPE_OPTIONS: SelectOption[] = (Object.keys(SUBTYPES_91E0) as Subtype91E0[]).map((v) => ({
  value: v,
  label: SUBTYPES_91E0[v].label,
}))

// ---------- opcje selektów specyficzne dla 91E0 (tab. 2) ----------

const FLORISTIC: GradedOption[] = [
  { value: 'typical', label: 'Kombinacja florystyczna typowa dla łęgu', grade: 'FV' },
  { value: 'impoverished', label: 'Kombinacja zubożona, lecz oparta na gatunkach typowych dla łęgu', grade: 'U1' },
  { value: 'dominatedByOthers', label: 'Kombinacja zdominowana przez gatunki nie łęgowe, a łąkowe lub ruderalne', grade: 'U2' },
]

const DOMINANCE: GradedOption[] = [
  { value: 'natural', label: 'We wszystkich warstwach dominują gatunki typowe, stosunki ilościowe naturalne', grade: 'FV' },
  { value: 'disturbed', label: 'Dominują gatunki typowe, ale relacje ilościowe zaburzone (dominacja facjalna)', grade: 'U1' },
  { value: 'foreign', label: 'W co najmniej jednej warstwie dominuje gatunek obcy dla naturalnego zbiorowiska', grade: 'U2' },
]

const EXPANSIVE: GradedOption[] = [
  { value: 'weak', label: 'Brak albo nie bardzo silnie ekspansywne', grade: 'FV' },
  { value: 'strong', label: 'Silnie ekspansywne, lecz nie ograniczają różnorodności runa', grade: 'U1' },
  { value: 'facies', label: 'Facjalnie dominują, ograniczając różnorodność runa', grade: 'U2' },
  { value: 'unknown', label: 'Tendencje dynamiczne trudne do określenia', grade: 'XX' },
]

const DEAD_WOOD_TOTAL: GradedOption[] = [
  { value: 'high', label: 'Ponad 20 m³/ha', grade: 'FV' },
  { value: 'mid', label: '10–20 m³/ha', grade: 'U1' },
  { value: 'low', label: 'Poniżej 10 m³/ha', grade: 'U2' },
]

const DEAD_WOOD_LARGE: GradedOption[] = [
  { value: 'many', label: 'Ponad 5 szt./ha', grade: 'FV' },
  { value: 'some', label: '3–5 szt./ha', grade: 'U1' },
  { value: 'few', label: 'Poniżej 3 szt./ha', grade: 'U2' },
]

const DIAMETER: SelectOption[] = [
  { value: '50', label: '50 cm (standard)' },
  { value: '30', label: '30 cm (drzewa z przyczyn naturalnych nie dorastają do 50 cm)' },
]

const RIVER: GradedOption[] = [
  { value: 'natural', label: 'Brak regulacji lub ciek zupełnie zrenaturalizowany po dawnej regulacji', grade: 'FV' },
  { value: 'soft', label: 'Regulacja „miękka”, z zachowaniem cech hydromorfologicznych cieku naturalnego', grade: 'U1' },
  { value: 'hard', label: 'Regulacja zmieniająca rytm zalewów lub linię cieku, urządzenia piętrzące', grade: 'U2' },
  { value: 'na', label: 'Nie dotyczy – łęg niezwiązany z ciekiem', grade: 'XX' },
]

const WATER: GradedOption[] = [
  { value: 'normal', label: 'Dynamika zalewów i przewodnienie podłoża normalne dla zbiorowiska', grade: 'FV' },
  { value: 'reduced', label: 'Dynamika zalewów i przewodnienie podłoża obniżone w stosunku do normalnego', grade: 'U1' },
  { value: 'none', label: 'Zupełny brak zalewów lub zupełnie przesuszone podłoże', grade: 'U2' },
]

// ---------- progi liczbowe ----------

/** Martwe drewno łączne (modyfikacja 2012): >20 m³/ha FV, 10–20 U1, <10 U2. */
export const gradeDeadWoodVolume = (m3: number): Grade => (m3 > 20 ? 'FV' : m3 >= 10 ? 'U1' : 'U2')
/** Dawna metoda (2006–2011): udział martwego drewna w miąższości drzewostanu, >10% FV, 3–10% U1, <3% U2. */
export const gradeDeadWoodShare = (share: number): Grade => (share > 10 ? 'FV' : share >= 3 ? 'U1' : 'U2')
/** Grube martwe drewno: >5 szt./ha FV, 3–5 U1, <3 U2. */
export const gradeLargeDeadWood = (perHa: number): Grade => (perHa > 5 ? 'FV' : perHa >= 3 ? 'U1' : 'U2')

/**
 * Inwazyjne gatunki obce (interpretacja opisowych progów tab. 2):
 * brak albo 1 gatunek do 1% – FV; więcej gatunków albo 1 powyżej 1% – U1; którykolwiek od 25% (facjalna dominacja) – U2.
 */
export function gradeInvasive(i: InputValues): Grade | null {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (rows.length === 0) return 'FV'
  const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  if (covers.some((c) => c >= 25)) return 'U2'
  if (rows.length > 1) return 'U1'
  if (covers.length === 0) return null
  return covers[0] <= 1 ? 'FV' : 'U1'
}

/** Termin: połowa maja – wrzesień, w górskich olszynkach do połowy października. */
export function dateWarning91E0(iso: string): string | null {
  const [, mm, dd] = iso.split('-').map(Number)
  if ((mm === 5 && dd >= 15) || (mm >= 6 && mm <= 9)) return null
  if (mm === 10 && dd <= 15)
    return 'Październik jest w terminie tylko dla górskich olszynek (91E0-6, 91E0-7). Runo innych łęgów może być niepełne.'
  return 'Termin poza optymalnym oknem (połowa maja – wrzesień). Runo może być nierozwinięte albo zamierające.'
}

const classLabel = (opts: GradedOption[], g: Grade) => opts.find((o) => o.grade === g)?.label ?? ''

export const methodology91E0: Methodology = {
  code: '91E0',
  priority: true,
  name: 'Łęgi wierzbowe, topolowe, olszowe i jesionowe (Salicetum albo-fragilis, Populetum albae, Alnenion glutinoso-incanae, olsy źródliskowe)',
  source:
    'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I (2010), rozdz. 91E0 (tab. 1 i 2), z modyfikacjami metodyki z 2012-07-31 i 2015-07-17',

  siteFields: forestSiteFields({
    code: '91E0',
    transect: '200x10 m',
    releveArea: 100,
    dateWindow: dateWarning91E0,
    extra: [
      {
        kind: 'select',
        name: 'subtype',
        label: 'Podtyp siedliska',
        options: SUBTYPE_OPTIONS,
        required: true,
        hint: 'Od podtypu zależą gatunki typowe i to, czy martwe drewno i wiek drzewostanu liczą się do oceny.',
        help: `Wybierz podtyp, do którego należy płat na transekcie (wg Poradnika ochrony siedlisk Natura 2000):
• 91E0-1 łęg wierzbowy i 91E0-2 łęg topolowy – nadrzeczne lasy dużych dolin, zalewane co roku albo co kilka lat;
• 91E0-3 niżowy łęg jesionowo-olszowy i 91E0-4 łęg gwiazdnicowy – doliny mniejszych cieków;
• 91E0-5 podgórski łęg jesionowy – nad potokami pogórza i na wyspowych stanowiskach na niżu;
• 91E0-6 nadrzeczna olszyna górska (olsza szara) i 91E0-7 bagienna olszyna górska;
• 91E0-8 źródliskowe lasy olszowe na niżu.

Dlaczego: przewodnik podaje gatunki typowe osobno dla podtypów, a modyfikacja metodyki z 2015 r. wyłącza w podtypach 91E0-6 i 91E0-7 martwe drewno (oba wskaźniki) i wiek drzewostanu z oceny struktury – górskie olszynki naturalnie są młode i ubogie w grube drewno.`,
      },
    ],
    overrides: {
      siteName: { placeholder: 'np. Tomasówka Górna' },
      communities: {
        hint: 'Np. Fraxino-Alnetum, Carici remotae-Fraxinetum, Alnetum incanae.',
        help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi: Salicetum albae, Populetum albae, Fraxino-Alnetum, Stellario nemorum-Alnetum glutinosae, Carici remotae-Fraxinetum, Alnetum incanae, Caltho-Alnetum albo źródliskowe lasy olszowe („Cardamino-Alnetum”). Gdy płat jest trudny do zaklasyfikowania, opisz to wprost (np. „cechy Carici remotae-Fraxinetum i Tilio-Acerion”).

Dlaczego: zespół wyznacza punkt odniesienia dla oceny – czego się spodziewać w drzewostanie i runie.`,
      },
      description: {
        rows: 8,
        hint: 'Położenie względem cieku, drzewostan, runo, warunki wodne, sąsiedztwo.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat: nad jakim ciekiem, na jakim podłożu, czy jest zalewany, czy zasilany wodami gruntowymi lub źródliskowymi;
• drzewostan: gatunki, ich udział, wiek;
• runo: gatunki typowe łęgów czy łąkowe i ruderalne, obecność neofitów;
• sąsiedztwo: użytki zielone, uprawy leśne, zabudowa.

Dlaczego: łęgi są silnie zróżnicowane. Opis pozwala kolejnemu obserwatorowi zrozumieć punkt odniesienia i przyczyny zmian.`,
      },
      areaHa: {
        help: `Powierzchnia płatu łęgu na stanowisku, w hektarach. Nie powierzchnia transektu (0,2 ha) ani całego kompleksu leśnego. Najlepiej z GIS (ortofotomapa, leśna mapa gospodarcza) albo z operatu urządzeniowego. Łęgi często tworzą wąskie pasy wzdłuż cieków – licz rzeczywisty pas, a nie całe wydzielenie.

Dlaczego: zmiana powierzchni płatu między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
      },
      altitude: {
        placeholder: 'np. 595–610',
        help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres.

Dlaczego: kontekst geograficzny – niżowe łęgi jesionowo-olszowe, podgórskie łęgi jesionowe i górskie olszynki mają inny skład gatunkowy.`,
      },
      date: {
        placeholder: 'DD.MM.RRRR, np. 22.07.2008',
        hint: 'Optymalnie od połowy maja do września; górskie olszynki do połowy października.',
        help: `Dzień obserwacji w terenie. Optymalny termin dla łęgów to zwykle od połowy maja do września – najlepiej późna wiosna i wczesne lato (o ile teren jest dostępny). Górskie olszynki można monitorować przez całe lato, a nawet jesienią do połowy października. Bardzo przydatna jest dodatkowa obserwacja stanu zalania w okresie „wielkiej wody wiosennej”.

Dlaczego: wczesną wiosną runo łęgów jest jeszcze nierozwinięte, a późną jesienią zamiera. Badanie powtarza się co najmniej raz na 5–6 lat, optymalnie co 3 lata.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne w obrębie transektu 200×10 m, każde o powierzchni 100 m², w skali Braun-Blanqueta. Gdy płat ma nietypowy kształt (np. wąski pas wzdłuż potoku), zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: forestReleveFields({
      area: 100,
      helps: {
        coverA: 'Warstwa A – drzewostan (olsza, jesion, wierzby, topole). Procent powierzchni zdjęcia przykryty koronami drzew, w rzucie pionowym.',
        coverB: 'Warstwa B – podszyt i podrost: czeremcha, leszczyna, kruszyna, porzeczka czarna, młode drzewa.',
        coverC: 'Warstwa C – runo: rośliny zielne, siewki drzew.\n\nDlaczego: w runie najlepiej widać, czy płat jest nadal łęgiem, czy dominują gatunki łąkowe, ruderalne albo neofity.',
        coverD: 'Warstwa D – mszysta: mchy i wątrobowce naziemne. W łęgach zwykle słabo rozwinięta.',
        unit: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Carici remotae-Fraxinetum”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić zmiany.',
      },
    }),
  },

  indicators: [
    forestArea({
      description:
        'Trend zmian powierzchni płatu oraz jego antropogeniczna fragmentacja (użytkowanie rolnicze części biochory łęgów, zręby, przecięcie groblami, drogami).',
      help: `Co wybrać: jak zmienia się powierzchnia płatu łęgu i czy jest on pocięty przez człowieka – zajęcie części potencjalnej biochory łęgów pod łąki i pola, zręby, groble, drogi, uprawy innych gatunków (np. świerka).

Pułapka: nie oceniaj jako fragmentacji sytuacji, w której płaty łęgów są rozdzielone korytem lub korytami rzeki albo starorzeczami – to naturalny układ.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie zmniejsza się” albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana',
        U1: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana',
        U2: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana',
      },
    }),
    {
      ...choiceIndicator({
        id: 'characteristic',
        label: 'Gatunki charakterystyczne',
        cardinal: true,
        description:
          'Typowość kombinacji florystycznej w porównaniu z najlepiej zachowanymi łęgami danego podtypu w obszarze. Ocenia się charakter całej kompozycji, nie liczbę gatunków.',
        help: `Co wpisać: gatunki charakterystyczne i typowe stwierdzone na transekcie, z pokryciem w % (z dokładnością do 10%), i ocenę całej kombinacji florystycznej.

Przewodnik mówi wprost: w łęgach praktycznie nie ma gatunków wiernych, które mogłyby być uniwersalnymi wskaźnikami. Ocenia się charakter całej kompozycji florystycznej, porównując ją z kompozycją najlepiej zachowanych łęgów w obszarze. Formularz pokazuje, ile gatunków typowych dla wybranego podtypu jest na liście – to tylko pomoc, ocenę wybierasz sam.

Gatunki typowe wg podtypów (tab. 1):
• łęg wierzbowy: wierzba biała i krucha, kielisznik zaroślowy, przytulia czepna, tojeść pospolita, mozga trzcinowata, rzepicha ziemnowodna, jaskier rozłogowy, jeżyna popielica, wierzba trójpręcikowa, żywokost lekarski, pokrzywa;
• łęg topolowy: topola biała, czarna i szara, perz, bylica pospolita, ostrożeń polny, skrzyp polny, poziewnik szorstki, przytulia czepna, bluszczyk kurdybanek, jeżyna popielica, pokrzywa;
• łęg olszowo-jesionowy: olsza czarna, jesion, czeremcha, niecierpek pospolity, pokrzywa, gajowiec żółty, gwiazdnica gajowa, śledziennica skrętolistna, czartawa pospolita, wietlica samicza, tojeść pospolita;
• źródliskowe lasy olszowe na niżu: olsza czarna, rzeżucha gorzka, szczyr trwały, śledziennica skrętolistna;
• podgórski łęg jesionowy: jesion, olsza szara, starzec Fuchsa, czyściec leśny, pokrzywa, świerząbek orzęsiony, niecierpek pospolity, jarzmianka większa, turzyca odległokłosa, czartawa pośrednia, skrzyp olbrzymi, szczaw gajowy, kopytnik, zawilec gajowy, jaskier kosmaty, kostrzewa olbrzymia, szczyr trwały, podagrycznik, przetacznik górski;
• nadrzeczna olszyna górska: olsza szara, bodziszek żałobny, pióropusznik strusi, śnieżyca wiosenna, oset łopianowaty, rutewka orlikolistna, lepiężniki, szałwia lepka i inne;
• bagienna olszyna górska: olsza szara, knieć błotna górska, świerząbek orzęsiony, tojeść gajowa, pępawa błotna, kozłek całolistny, sitowie leśne, niezapominajka błotna, lepiężnik biały.

Dlaczego: kombinacja florystyczna pokazuje, czy płat jest nadal łęgiem, czy przechodzi w zbiorowisko łąkowe albo ruderalne. Wskaźnik kardynalny.`,
        options: FLORISTIC,
        inputLabel: 'Kombinacja florystyczna',
        before: [
          speciesInput(
            'Gatunki charakterystyczne na transekcie',
            'Gatunki typowe dla łęgu (lista dla podtypów jest pod „?” przy nazwie wskaźnika), z pokryciem w % transektu.',
            true,
          ),
        ],
      }),
      explain: (i, ctx) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const s = subtypeOf(ctx?.site)
        if (!s) return 'Wybierz podtyp siedliska w „Stanowisku” – formularz pokaże, ile gatunków typowych dla niego jest na liście.'
        const { present, total } = typicalMatch(rows, s)
        return `Podtyp ${s}: na liście ${present.length} z ${total} gatunków typowych z przewodnika${present.length ? ` (${present.join(', ')})` : ''}. To tylko pomoc – oceniasz całą kombinację.`
      },
    },
    dominantSpecies({
      cardinal: true,
      description:
        'Czy w każdej warstwie dominują gatunki typowe dla danego zbiorowiska łęgowego. Wymienia się tylko gatunki o pokryciu co najmniej 10%.',
      help: `Co wpisać: dominanty każdej warstwy z pokryciem (a – drzewostan, b – podszyt, c – runo), tylko gatunki o pokryciu co najmniej 10%, i ocenę, czy są typowe dla zbiorowiska.

Przykłady zaburzeń: zbyt duży udział kłosownicy leśnej, jeżyny gruczołowatej czy jodły w runie górskich olszynek; facjalna dominacja pokrzywy albo jeżyny popielicy (w łęgu wierzbowym tworzą one facje naturalnie); dominacja neofitów (niecierpek gruczołowaty, nawłoć).

Formularz ostrzega, gdy na liście jest gatunek inwazyjny, ekspansywny albo obce drzewo z pokryciem co najmniej 10%, a wybrano „naturalne”.

Dlaczego: struktura dominacji mówi, czy płat zachował naturalny charakter. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'We wszystkich warstwach dominują gatunki typowe dla siedliska, przy czym są naturalne stosunki ilościowe (nie ma dominacji facjalnej)',
        U1: 'We wszystkich warstwach dominują gatunki typowe dla siedliska, przy czym są zaburzone relacje ilościowe (dominacja facjalna)',
        U2: 'W jednej lub więcej warstw dominuje gatunek obcy dla naturalnego zbiorowiska roślinnego',
      },
      options: DOMINANCE,
      flag: (name) => ['invasive', 'expansive', 'tree-geo-alien'].includes(findSpecies91E0(name)?.group ?? ''),
      flagText: 'to gatunki nietypowe dla łęgu',
    }),
    geoAlienTrees({
      cardinal: false,
      description:
        'Drzewa poza naturalnym zasięgiem: topole euroamerykańskie, jesion pensylwański, klon jesionolistny, na Pomorzu także świerk, w wyższych położeniach górskich olsza czarna z sadzenia.',
      help: `Co wpisać: każdy gatunek drzewa rosnący poza swoim naturalnym zasięgiem, z udziałem w drzewostanie w %, oraz czy odnawia się spontanicznie.

W łęgach to zwykle topole euroamerykańskie (kanadyjskie), jesion pensylwański, klon jesionolistny; na Pomorzu także świerk, a w wyższych położeniach górskich olsza czarna (pochodząca z sadzenia). Formularz liczy wszystko, co wpiszesz na tę listę – świerka czy olszy czarnej w ich naturalnym zasięgu tu nie wpisuj.

Przypadkową obecność 1–2 osobników obcego gatunku można tolerować nawet przy FV. Większy udział, a zwłaszcza odnawianie się, obniża ocenę.

Dlaczego: obce drzewa zmieniają skład ściółki, zacienienie i dynamikę łęgu. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Poniżej 1% i nie odnawiające się',
        U1: 'Poniżej 10% i nie odnawiające się',
        U2: 'Ponad 10% lub spontanicznie odnawiające się, niezależnie od udziału',
      },
    }),
    invasiveAliens({
      label: 'Obce gatunki inwazyjne w runie i podszycie',
      description:
        'Neofity w runie i podszycie: niecierpek drobnokwiatowy i gruczołowaty, uczep amerykański, kolczurka klapowana, nawłoć późna, winobluszcz, rdestowce. Łęgi są na nie bardzo podatne.',
      help: `Co wpisać: każdy gatunek obcy geograficznie w runie i podszycie, z pokryciem w % transektu. Najczęstsze w łęgach: niecierpek drobnokwiatowy Impatiens parviflora, niecierpek gruczołowaty I. glandulifera, uczep amerykański Bidens frondosa, kolczurka klapowana Echinocystis lobata, nawłoć późna Solidago gigantea, winobluszcz pięciolistkowy Parthenocissus quinquefolia, rdestowce Reynoutria japonica i R. sachalinensis. Brak – zostaw listę pustą.

Przewodnik każe odnotować każdy gatunek obcy, ale obniżać ocenę tylko przy lokalnej inwazyjności. Progi z tab. 2 są opisowe. Formularz przyjmuje:
• brak albo jeden gatunek o pokryciu do 1% („nieliczny, sporadyczny”) – FV;
• więcej niż jeden gatunek albo jeden powyżej 1% („liczny”) – U1;
• jakikolwiek gatunek obcy z pokryciem 25% i więcej („facjalna dominacja”) – U2.
To interpretacja, nie norma – przy innej ocenie popraw podpowiedź.

Dlaczego: łęgi są ekosystemami o wysokiej podatności na neofityzację. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Obecny najwyżej 1 gatunek, nieliczny – sporadyczny',
        U1: 'Więcej niż 1 gatunek lub nawet 1 gatunek, jeżeli liczny',
        U2: 'Facjalna dominacja gatunku obcego',
      },
      inputLabel: 'Obce gatunki inwazyjne w runie i podszycie',
      inputHelp: 'Gatunki obce geograficznie w runie i podszycie z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: (_c, i) => gradeInvasive(i),
      note: 'Przyjęto: „nieliczny” do 1%, „facjalna dominacja” od 25% – to interpretacja.',
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        return list ? `Inwazyjne: ${list}` : 'Brak'
      },
    }),
    {
      ...choiceIndicator({
        id: 'expansive',
        label: 'Rodzime gatunki ekspansywne roślin zielnych',
        description:
          'Ekspansja apofitów nietypowych dla dobrze zachowanych płatów: jeżyny, śmiałek darniowy, pokrzywa, podagrycznik. Neofitów tu nie wpisuj.',
        help: `Co wpisać: rodzime gatunki, które wyraźnie się rozprzestrzeniają, z pokryciem, i ocenę siły ekspansji. W łęgach to np. jeżyny, śmiałek darniowy, pokrzywa, podagrycznik, w górach kłosownica leśna i jeżyna gruczołowata. Obniża ocenę wyraźna ekspansja jednego z tych gatunków – tak silna, że ogranicza występowanie innych gatunków w runie. Neofitów (gatunków obcych geograficznie) tu nie uwzględniaj, mają swój wskaźnik.

Gdy tendencji dynamicznych nie da się ocenić w jednej obserwacji, wybierz „trudne do określenia” – formularz poda XX.

Dlaczego: ekspansja apofitów zwykle oznacza przesuszenie, eutrofizację albo prześwietlenie drzewostanu. Wskaźnik pomocniczy.`,
        thresholds: {
          FV: 'Nie bardzo silnie ekspansywne',
          U1: 'Silnie ekspansywne, lecz nie ograniczające różnorodności runa',
          U2: 'Facjalnie dominujące w sposób ograniczający różnorodność runa',
        },
        options: EXPANSIVE,
        inputLabel: 'Siła ekspansji',
        before: [speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.')],
      }),
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (i.choice === 'unknown') return list ? `${list}. Tendencje dynamiczne trudne do określenia` : 'Tendencje dynamiczne gatunków runa trudne do określenia'
        return list || labelOf(EXPANSIVE, i.choice)
      },
    },
    {
      id: 'deadWood',
      label: 'Martwe drewno (łączne zasoby)',
      parameter: 'structure',
      excluded: mountainExcluded,
      description:
        'Łączne zasoby rozkładającego się drewna (drzewa i ich części leżące i stojące od 7 cm grubości w cieńszym końcu, bez pniaków), w m³/ha.',
      help: `Co wpisać: łączną objętość martwego drewna w m³ na hektar. Uwzględnij martwe drzewa i części drzew leżące i stojące od 7 cm grubości w cieńszym końcu; pniaków nie wliczaj. Najlepiej zmierzyć na transekcie (0,2 ha): zsumuj objętość fragmentów i pomnóż przez 5. Można też wziąć dane z urządzania lasu (od 2011 r. instrukcja urządzania lasu mierzy martwe drewno).

Progi z modyfikacji metodyki z 2012 r.: ponad 20 m³/ha – FV, 10–20 m³/ha – U1, poniżej 10 m³/ha – U2. Do 2011 r. szacowano wzrokowo udział martwego drewna w miąższości drzewostanu (ponad 10% – FV, 3–10% – U1, poniżej 3% – U2). Jeśli masz tylko taki szacunek, wpisz go w ostatnim polu i zostaw klasę pustą – formularz użyje dawnych progów.

${MOUNTAIN_NOTE}

Dlaczego: martwe drewno to kluczowy dla różnorodności biologicznej element lasu. Próg FV (20 m³/ha) jest i tak ok. 2 razy niższy niż potrzeby organizmów saproksylicznych. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Ponad 20 m³/ha', U1: '10–20 m³/ha', U2: 'Poniżej 10 m³/ha' },
      inputs: [
        {
          ...selectInput(
            'Zasoby martwego drewna',
            DEAD_WOOD_TOTAL,
            'Klasa zasobów. Gdy mierzyłeś, wpisz też liczbę poniżej – ma pierwszeństwo przed klasą. Gdy masz tylko szacunek dawną metodą (% miąższości), klasę zostaw pustą.',
          ),
          required: false,
        },
        {
          kind: 'number',
          name: 'm3PerHa',
          label: 'Objętość martwego drewna (jeśli mierzona)',
          unit: 'm³/ha',
          min: 0,
          help: 'Łączna objętość martwego drewna od 7 cm grubości, w m³/ha. Z transektu 0,2 ha: suma objętości × 5. Opcjonalne.',
        },
        pct('share', 'Udział w miąższości drzewostanu (dawna metoda)', {
          required: false,
          help: 'Wzrokowy szacunek udziału objętości martwego drewna w objętości drzew żywych, w %. Stosowany do 2011 r., progi 3% i 10%. Wpisz tylko, gdy nie masz pomiaru w m³/ha. Opcjonalne.',
        }),
      ],
      suggest: (i) => {
        const m3 = num(i.m3PerHa)
        if (m3 !== undefined) return gradeDeadWoodVolume(m3)
        if (i.choice) return byOption(gradeMap(DEAD_WOOD_TOTAL))(i)
        const share = num(i.share)
        return share === undefined ? null : gradeDeadWoodShare(share)
      },
      explain: (i, ctx) => {
        const share = num(i.share)
        const fromShare = num(i.m3PerHa) === undefined && !i.choice && share !== undefined
        return joinExplain(fromShare ? `Ocena z dawnej metody: ${fmt(share)} miąższości (progi 3% i 10%).` : null, mountainExplain(ctx))
      },
      warn: (i) => {
        const m3 = num(i.m3PerHa)
        if (m3 === undefined || !i.choice) return null
        const g = gradeDeadWoodVolume(m3)
        return gradeMap(DEAD_WOOD_TOTAL)[String(i.choice)] === g ? null : `${plNum(m3)} m³/ha to klasa „${classLabel(DEAD_WOOD_TOTAL, g)}”.`
      },
      describe: (i) => {
        const m3 = num(i.m3PerHa)
        const share = num(i.share)
        if (m3 !== undefined) return `${plNum(m3)} m³/ha`
        if (share !== undefined) return `Ok. ${fmt(share)} miąższości żywego drzewostanu`
        return labelOf(DEAD_WOOD_TOTAL, i.choice)
      },
    },
    (() => {
      const base = deadWoodCount({
        id: 'largeDeadWood',
        label: 'Martwe drewno leżące lub stojące > 3 m długości i > 50 cm grubości',
        cardinal: true,
        excluded: mountainExcluded,
        description:
          'Liczba grubych kłód i stojących martwych pni (>3 m, >50 cm grubości) na hektar. Gdy drzewa z przyczyn naturalnych nie dorastają do 50 cm, próg obniża się do 30 cm.',
        help: `Co wpisać: liczbę grubych kłód leżących i martwych pni stojących na hektar. Liczą się elementy dłuższe (wyższe) niż 3 m i grubsze niż 50 cm – u stojących mierzonych w pierśnicy, u leżących w pierśnicy, jeśli da się ją określić, albo w grubszym końcu kłody. Na transekcie 200×10 m (0,2 ha) policz sztuki i pomnóż przez 5.

Gdy w danym płacie drzewa z przyczyn naturalnych nie dorastają do 50 cm grubości (np. olsza szara, wierzby), próg grubości obniża się do 30 cm – zaznacz to w polu „Próg grubości”.

${MOUNTAIN_NOTE}

Dlaczego: grube rozkładające się kłody to mikrosiedlisko najbardziej wymagających organizmów saproksylicznych, a w lasach najczęściej brakuje właśnie drewna grubowymiarowego. Wskaźnik kardynalny (od modyfikacji metodyki z 2012 r.).`,
        thresholds: { FV: 'Ponad 5 szt./ha', U1: '3–5 szt./ha', U2: 'Poniżej 3 szt./ha' },
        options: DEAD_WOOD_LARGE,
        fieldHelp: 'Sztuki martwego drewna >3 m długości i powyżej progu grubości, na hektar. Z transektu 0,2 ha: liczba sztuk × 5. Opcjonalne.',
        grade: gradeLargeDeadWood,
      })
      const diameterField: FieldDef = {
        kind: 'select',
        name: 'diameter',
        label: 'Próg grubości',
        options: DIAMETER,
        defaultValue: '50',
        help: 'Standardowo 50 cm. Obniż do 30 cm tylko wtedy, gdy drzewa w płacie z przyczyn naturalnych nie dorastają do 50 cm grubości – i napisz to w opisie.',
      }
      return {
        ...base,
        inputs: [...base.inputs, diameterField],
        explain: (i: InputValues, ctx?: IndicatorContext) =>
          joinExplain(i.diameter === '30' ? 'Próg grubości obniżony do 30 cm.' : null, mountainExplain(ctx)),
        describe: (i: InputValues) => {
          const v = num(i.perHa)
          const text = v === undefined ? labelOf(DEAD_WOOD_LARGE, i.choice) : `Ok. ${plNum(v)} szt./ha`
          return text && i.diameter === '30' ? `${text} (próg grubości 30 cm)` : text
        },
      }
    })(),
    {
      ...choiceIndicator({
        id: 'river',
        label: 'Naturalność koryta rzecznego (stosować tylko, jeżeli występowanie łęgu jest związane z ciekiem)',
        description:
          'Ślady antropogenicznego przekształcenia koryta cieku, z którym związany jest łęg: regulacja, umocnienia, urządzenia piętrzące.',
        help: `Co wybrać: stan koryta cieku, z którym związany jest łęg – czy jest naturalne (meandry, podcięcia, odsypy, wykroty), uregulowane metodami „miękkimi” (z zachowaniem cech hydromorfologicznych), czy twardo (wyprostowane, umocnione, z progami i jazami zmieniającymi rytm zalewów).

Wskaźnik stosuje się tylko wtedy, gdy występowanie łęgu jest związane z ciekiem naturalnym. Łęg niezwiązany z ciekiem (np. na brzegu jeziora, na wysięku) – wybierz „nie dotyczy”, formularz poda XX, które nie psuje oceny struktury.

Dlaczego: regulacja koryta zmienia rytm zalewów i poziom wód gruntowych, od których łęg zależy. Wskaźnik pomocniczy.`,
        thresholds: {
          FV: 'Brak regulacji lub ciek zupełnie zrenaturalizowany po dawniejszej regulacji',
          U1: 'Regulacja wykonana metodami „miękkimi”, z zachowaniem cech hydromorfologicznych cieku naturalnego',
          U2: 'Regulacja zmieniająca rytm zalewów lub regulacja zupełnie zmieniająca linię cieku. Istnienie urządzeń piętrzących zmieniających reżim cieku',
        },
        options: RIVER,
        inputLabel: 'Stan koryta',
      }),
      describe: (i) => (i.choice === 'natural' ? 'Brak śladów regulacji' : labelOf(RIVER, i.choice)),
    },
    choiceIndicator({
      id: 'water',
      label: 'Reżim wodny (w tym rytm zalewów, jeśli występują)',
      cardinal: true,
      description:
        'Dynamika zalewów i przewodnienie podłoża w stosunku do tego, co normalne dla danego zbiorowiska. Nie bezwzględna częstotliwość zalewów.',
      help: `Co wybrać: czy warunki wodne są normalne dla tego typu łęgu. Typy łęgów mają różny „naturalny rytm zalewu”: łęgi wierzbowe są zalewane zwykle co roku, topolowe co kilka lat, a niektóre formy (bagienne olszyny górskie, łęgi źródliskowe, część łęgów jesionowo-olszowych) w ogóle nie podlegają zalewom powierzchniowym, tylko zależą od ruchu wód gruntowych – dla nich ocenia się przewodnienie podłoża.

Pomagają: ślady zalewu (namuły, napływki, linie na pniach), wysięki i źródła, poziom wody w dołku albo piezometrze, odczyty z limnigrafu czy wodowskazu na cieku, rowy odwadniające i obwałowania w pobliżu. Opisz, na czym opierasz ocenę.

Dlaczego: warunki wodne to podstawowy dla łęgów czynnik ekologiczny. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Dynamika zalewów i przewodnienie podłoża normalne z punktu widzenia odpowiedniego ekosystemu / zbiorowiska roślinnego',
        U1: 'Dynamika zalewów i przewodnienie podłoża obniżone w stosunku do normalnego',
        U2: 'Zupełny brak zalewów lub zupełnie przesuszone podłoże',
      },
      options: WATER,
      inputLabel: 'Reżim wodny',
    }),
    {
      ...standAge({
        excluded: mountainExcluded,
        help: `Co wybrać: udział drzew starszych niż 100 lat i starszych niż 50 lat w drzewostanie (udział objętościowy, czyli miąższość). Dane zwykle są w leśnym operacie urządzeniowym albo Banku Danych o Lasach. Liczby możesz dopisać w polach poniżej – formularz sprawdzi zgodność z wybraną klasą.

${MOUNTAIN_NOTE}

Dlaczego: stary drzewostan oznacza ciągłość lasu i dojrzałą fitocenozę. Wskaźnik pomocniczy.`,
      }),
      explain: (_i: InputValues, ctx?: IndicatorContext) => mountainExplain(ctx),
    },
    verticalStructure({
      description: 'Wielogeneracyjna, zróżnicowana struktura drzewostanu. Nadmierne wyrównanie wieku i struktury obniża ocenę.',
      help: `Co wybrać: czy drzewostan jest wielogeneracyjny – są drzewa różnego wieku i wysokości, luki, podrost, kilka warstw – czy wyrównany jak uprawa leśna. Przewodnik zauważa, że właściwszym wskaźnikiem byłaby warstwowo-przestrzenna struktura drzewostanu traktowana łącznie – patrz też na rozmieszczenie drzew w poziomie.

Dlaczego: naturalny łęg ma zróżnicowaną strukturę wiekową. Wskaźnik pomocniczy.`,
    }),
    naturalRegeneration({
      description: 'Łączne pokrycie odnowienia wszystkich naturalnie występujących w drzewostanie gatunków drzew.',
      help: `Co wybrać: czy w płacie odnawiają się gatunki drzew naturalnie występujące w drzewostanie (olsza, jesion, wierzby, topole, jawor, wiąz). W opisie podaj procent pokrycia transektu przez odnowienie, dla każdego gatunku osobno (np. „Acer pseudoplatanus <1%, Fraxinus excelsior 1–2%”).

Dlaczego: drzewostan powinien się utrzymywać sam. Brak odnowienia może być tylko chwilowy, dlatego wskaźnik jest pomocniczy i nie przesądza automatycznie o obniżeniu oceny struktury.`,
      inputLabel: 'Odnowienie naturalne',
    }),
    loggingDamage({
      description: 'Naruszenia runa i powierzchni gleby, podszytu i podrostu, zasobów martwego drewna. Nie sam fakt pozyskania i obecność pniaków.',
      help: `Co wybrać: jak bardzo prace leśne naruszyły runo, glebę, podszyt, podrost i zasoby martwego drewna. Patrz na ślady zrywki, koleiny, uszkodzone drzewa. Sam fakt prowadzenia pozyskania drewna i obecność pniaków to jeszcze nie zniszczenie.

Dlaczego: gleby łęgowe są wilgotne i łatwo je rozjeździć. Wskaźnik pomocniczy – ekstensywne użytkowanie nie przesądza automatycznie o obniżeniu oceny.`,
    }),
    otherDistortions({
      help: `Co wybrać i opisać: inne przekształcenia płatu niezwiązane z pozyskaniem drewna – rozjeżdżanie, wydeptywanie, zaśmiecenie (łęgi przy zabudowaniach i drogach są na nie szczególnie narażone), wysypiska gałęzi, umocnienia brzegów. W polu opisu wymień je krótko.

Dlaczego: zwiększona antropopresja zmienia runo i ułatwia wnikanie neofitów. Wskaźnik pomocniczy.`,
    }),
    keySpecies({
      description:
        'Stosować tylko, gdy są dane: np. dzięcioł białogrzbiety i średni, muchołówka białoszyja, zgniotki, kwietnica okazała, ciołek matowy, pachnica, przeplatka maturna.',
      help: `Co wybrać: stan gatunków chronionych, zagrożonych i rzadkich, lokalnie typowych dla łęgów i ważnych dla różnorodności biologicznej, np. dzięcioł białogrzbiety Dendrocopos leucotos, muchołówka białoszyja Ficedula albicollis, dzięcioł średni Dendrocopos medius, zgniotki Cucujus spp., kwietnica okazała Protaetia aeruginosa, ciołek matowy Dorcus parallelipipedus, pachnica Osmoderma spp., przeplatka maturna Euphydryas maturna. Wybór gatunków zależy od obszaru.

Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX). XX tego wskaźnika nie psuje oceny struktury, bo nie jest on kardynalny.`,
    }),
  ],

  prospects: {
    description:
      'Czy siedlisko utrzyma się w stanie niepogorszonym w perspektywie 10–20 lat: status prawny płatu (las czy zadrzewienie), gospodarka i zapisy planu urządzenia lasu, zagrożenie wycinką w ramach ochrony przeciwpowodziowej, inwestycje hydrotechniczne.',
    help: `Oceniając perspektywy ochrony w przyszłości, zwróć uwagę:
• czy płaty siedliska są formalnie „lasem” czy „zadrzewieniem” i w czyim są zarządzie;
• czy nie ma zagrożenia wycięciem łęgów, np. w ramach ochrony przeciwpowodziowej;
• jeśli łęg jest formalnie lasem: jaka gospodarka jest w nim prowadzona oraz jakie zapisy w planie urządzenia lasu zaproponowano dla poszczególnych płatów;
• na terenach, gdzie wykonano inwentaryzację przyrodniczą (np. w Lasach Państwowych), czy siedlisko zidentyfikowano prawidłowo – to może mieć duże znaczenie dla jego ochrony;
• plany inwestycji hydrotechnicznych.

Dlaczego: perspektywy to osobny parametr oceny ogólnej.`,
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
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci, odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie gatunki, sąsiedztwo innych siedlisk (9180, 9170, 6430), ostoja ptaków.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91E0: rzadkie i chronione gatunki, sąsiedztwo innych siedlisk (np. 9180 jaworzyny, 9170 grądy, 6430 ziołorośla), funkcja korytarza ekologicznego. Brak informacji – „Brak danych”.

Dlaczego: łęgi zwykle tworzą kompleks z innymi siedliskami doliny. Planując ochronę, trzeba wiedzieć, co jeszcze się na nich odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): wyłączenie z użytkowania, renaturyzacja cieku, budowa zastawek, usuwanie gatunków obcych. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Nie”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91E0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91E0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91E0(name)
    return e ? GROUP_LABELS_91E0[e.group] : undefined
  },
}
