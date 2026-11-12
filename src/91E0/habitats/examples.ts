// Przykład wypełnionej karty z przewodnika metodycznego GIOŚ (rozdz. 91E0, „Przykład wypełnionej karty obserwacji”):
// Tomasówka Górna, 91E0-5 podgórski łęg jesionowy, 22.07.2008. Koordynator w przewodniku to już „Jan Kowalski”.
// Teksty „wartość lub opis” przepisane z karty, selekty ustawione zgodnie z ocenami z karty.
// Współrzędne są w przewodniku celowo urwane („N 50°16' …”) – zostawione tak samo.
// Kod oddziaływania 160 (stara klasyfikacja) zapisany jako B02.
// Martwe drewno w 2008 r. szacowano jako % miąższości – przykład korzysta z pola „dawna metoda”.
import type { BraunBlanquet, CardValues, InputValues, Layer, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology91E0 } from './methodology'

/** „a: Acer pseudoplatanus 2, Fraxinus excelsior 3; b: …” -> wiersze zdjęcia fitosocjologicznego. */
export function parseReleve(text: string): ReleveSpeciesRow[] {
  return text.split(';').flatMap((part) => {
    const m = part.trim().match(/^([abcd]):\s*(.*)$/i)
    if (!m) return []
    const layer = m[1].toUpperCase() as Layer
    return m[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const hit = s.match(/^(.*\S)\s+(r|\+|[1-5])$/)
        return hit
          ? { layer, name: hit[1], abundance: hit[2] as BraunBlanquet }
          : { layer, name: s, abundance: '' as const }
      })
  })
}

const COORDS = "N 50°16' …\"; E 16°48' …\""

const releve = (o: { altitude: number; slope?: number; exposure?: string; a: number; b: number; c: number; species: string }): InputValues => ({
  coords: COORDS,
  altitude: o.altitude,
  area: 100,
  slope: o.slope,
  exposure: o.exposure ?? '',
  coverA: o.a,
  coverB: o.b,
  coverC: o.c,
  coverD: undefined,
  heightA: undefined,
  heightB: undefined,
  heightC: undefined,
  heightD: undefined,
  unit: 'Carici remotae-Fraxinetum (z cechami Tilio-Acerion)',
  species: parseReleve(o.species),
})

const RELEVE_I = releve({
  altitude: 595,
  a: 55,
  b: 20,
  c: 80,
  species:
    'a: Acer pseudoplatanus 2, Fraxinus excelsior 3; b: Acer pseudoplatanus 1, Corylus avellana 2, Lonicera xylosteum 1, Rosa pendulina 2; c: Acer platanoides +, Aegopodium podagraria 2, Asarum europaeum 2, Athyrium filix-femina +, Carex sylvatica +, Chaerophyllum hirsutum +, Chrysosplenium alternifolium +, Corylus avellana +, Crepis paludosa +, Deschampsia caespitosa r, Dryopteris carthusiana r, Dryopteris filix-mas 1, Epilobium montanum +, Filipendula ulmaria r, Fraxinus excelsior 1, Galeobdolon luteum 2, Galium aparine +, Geranium robertianum 1, Impatiens noli-tangere 1, Impatiens parviflora 1, Mycelis muralis r, Oxalis acetosella 2, Paris quadrifolia +, Petasites albus +, Picea abies r, Poa trivialis 1, Polygonatum verticillatum +, Ranunculus lanuginosus 1, Ribes uva-crispa +, Rubus idaeus +, Senecio nemorensis 2, Stellaria nemorum 2, Thalictrum aquilegiifolium +, Urtica dioica +, Veratrum lobelianum r',
})

const RELEVE_II = releve({
  altitude: 600,
  a: 65,
  b: 55,
  c: 85,
  species:
    'a: Acer pseudoplatanus 2, Fraxinus excelsior 4; b: Acer pseudoplatanus 1, Corylus avellana 3, Rosa pendulina 3, Ulmus glabra r; c: Acer platanoides +, Acer pseudoplatanus +, Aegopodium podagraria 2, Asarum europaeum 2, Athyrium filix-femina 1, Campanula trachelium 1, Chaerophyllum hirsutum 1, Chrysosplenium alternifolium +, Cirsium oleraceum +, Crepis paludosa 2, Deschampsia caespitosa +, Dryopteris filix-mas 1, Filipendula ulmaria 1, Galeobdolon luteum 2, Galium aparine +, Impatiens noli-tangere 1, Lonicera xylosteum 1, Mercurialis perennis 2, Mycelis muralis 1, Oxalis acetosella 1, Paris quadrifolia +, Petasites albus 2, Phyteuma spicatum +, Poa nemoralis +, Poa remota +, Ranunculus lanuginosus 1, Ribes uva-crispa 1, Senecio nemorensis 2, Stellaria nemorum 1, Thalictrum aquilegiifolium +, Ulmus glabra +, Urtica dioica +, Veratrum lobelianum 1',
})

const RELEVE_III = releve({
  altitude: 610,
  slope: 10,
  exposure: 'E',
  a: 55,
  b: 45,
  c: 85,
  species:
    'a: Acer pseudoplatanus 3, Fraxinus excelsior 3, Picea abies 1; b: Acer pseudoplatanus 2, Corylus avellana 2, Rosa pendulina 3; c: Acer pseudoplatanus 1, Aegopodium podagraria 2, Asarum europaeum 2, Carex sylvatica 2, Chrysosplenium alternifolium +, Cirsium oleraceum r, Deschampsia caespitosa r, Dryopteris carthusiana +, Dryopteris filix-mas 1, Epilobium montanum r, Euphorbia dulcis +, Fraxinus excelsior 1, Galeobdolon luteum r, Galium aparine +, Geum urbanum 1, Heracleum sphondylium r, Impatiens noli-tangere 1, Impatiens parviflora 1, Maianthemum bifolium 1, Oxalis acetosella 2, Paris quadrifolia +, Petasites albus 2, Poa remota +, Polygonatum verticillatum 1, Primula elatior 1, Ranunculus lanuginosus +, Ribes uva-crispa +, Rubus idaeus 1, Senecio fuchsii 2, Sorbus aucuparia +, Stellaria nemorum 1, Thalictrum aquilegiifolium 2, Urtica dioica 1, Viola reichenbachiana +',
})

export const tomasowkaGorna: CardValues = {
  ...emptyCardValues(methodology91E0),
  site: {
    siteName: 'Tomasówka Górna',
    guid: '',
    subtype: '91E0-5',
    communities:
      'Siedlisko trudno jednoznacznie zaklasyfikować do rozpoznanych dotąd w Sudetach zespołów roślinnych. Z jednej strony posiada wiele cech podgórskiego łęgu jesionowego Carici remotae-Fraxinetum, z drugiej natomiast pod względem kompozycji gatunkowej zbliżone jest nieco do zbiorowisk ze związku Tilio-Acerion, zwłaszcza do ościennych Mercuriali-Fraxinetum.',
    description:
      'Las jesionowo-jaworowy w górnym biegu potoku Tomaszówka (Tomaszowski Potok). Rozwija się w postaci wąskiego pasa na wybitnie kamienistym podłożu wzdłuż brzegów rzeki. Sąsiaduje z użytkami zielonymi i monokulturami świerkowymi posadzonymi na stromych stokach doliny, zajmującymi zapewne miejsce występujących tu niegdyś lasów stokowych ze związku Tilio-Acerion. Powierzchnia płatów siedliska: 0,25–0,3 ha.',
    areaHa: 0.3,
    protectedAreas: 'PLH020019 Pasmo Krowiarki',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '10x200 m',
    altitude: '595–610',
    date: '2008-07-22',
    observer: 'Jan Kowalski',
  },
  releves: [RELEVE_I, RELEVE_II, RELEVE_III],
  indicators: {
    area: {
      inputs: { choice: 'slow' },
      value: '0,25–0,3 ha. Ograniczona fragmentacja uprawami świerka',
      grade: 'U1',
    },
    characteristic: {
      inputs: {
        choice: 'impoverished',
        species: [
          { name: 'Fraxinus excelsior', cover: 50 },
          { name: 'Stellaria nemorum', cover: 5 },
          { name: 'Petasites albus', cover: 20 },
          { name: 'Crepis paludosa', cover: 0.5 },
          { name: 'Aegopodium podagraria', cover: 10 },
          { name: 'Urtica dioica', cover: 1 },
          { name: 'Galium aparine', cover: 0.5 },
          { name: 'Thalictrum aquilegiifolium', cover: 1 },
          { name: 'Chaerophyllum hirsutum', cover: 1 },
        ],
      },
      value:
        'Fraxinus excelsior 45–50%, Stellaria nemorum 3–5%, Petasites albus 15–20%, Crepis paludosa <1%, Aegopodium podagraria 5–10%, Urtica dioica 1%, Galium aparine <1%, Thalictrum aquilegiifolium 1%, Chaerophyllum hirsutum 1%. Liczba i pokrycie gatunków charakterystycznych w runie stosunkowo niskie w porównaniu z typowymi płatami Carici remotae-Fraxinetum. Ponadto brak gatunków wybitnie bagiennych będących stałym składnikiem zabagnionych płatów podgórskiego łęgu jesionowego w Sudetach, m.in. Carex remota, Glyceria spp., Veronica beccabunga, Veronica montana',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        choice: 'disturbed',
        species: [
          { name: 'Acer pseudoplatanus', cover: 20 },
          { name: 'Fraxinus excelsior', cover: 50 },
          { name: 'Corylus avellana', cover: 30 },
          { name: 'Rosa pendulina', cover: 30 },
          { name: 'Asarum europaeum', cover: 20 },
          { name: 'Petasites albus', cover: 20 },
          { name: 'Mercurialis perennis', cover: 20 },
        ],
      },
      value:
        'a: Acer pseudoplatanus 15–20%, Fraxinus excelsior 45–50%; b: Corylus avellana 20–30%, Rosa pendulina 20–30%; c: Asarum europaeum 15–20%, Petasites albus 15–20%, Mercurialis perennis 15–20%',
      grade: 'U1',
    },
    geoAlien: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    invasive: {
      inputs: { species: [{ name: 'Impatiens parviflora', cover: 0.5 }] },
      value: 'Inwazyjne: Impatiens parviflora <1%. Inne: brak',
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [], choice: 'unknown' },
      value: 'Tendencje dynamiczne gatunków runa trudne do określenia',
      grade: 'XX',
    },
    deadWood: {
      inputs: { choice: '', share: 5 },
      value: 'Ok. 5% miąższości żywego drzewostanu. Martwe drzewa stojące i leżące gł. świerka; gałęzie drzew liściastych',
      grade: 'U1',
    },
    largeDeadWood: {
      inputs: { choice: 'some', perHa: 3, diameter: '50' },
      value: 'Ok. 3 szt./ha',
      grade: 'U1',
    },
    river: { inputs: { choice: 'natural' }, value: 'Brak śladów regulacji', grade: 'FV' },
    water: {
      inputs: { choice: 'normal' },
      value: 'Normalne, nie ma antropogenicznych zniekształceń reżimu wodnego',
      grade: 'FV',
    },
    age: {
      inputs: { choice: 'mid', share100: 0, share50: 60 },
      value: 'Drzewostan różnowiekowy, ale bez drzew starych. Udział drzew >100 lat: 0%. Udział drzew >50 lat: 60%',
      grade: 'U1',
    },
    vertical: { inputs: { choice: 'natural' }, value: 'Naturalna; zróżnicowana', grade: 'FV' },
    regeneration: {
      inputs: { choice: 'abundant' },
      value: 'Acer pseudoplatanus <1%, Fraxinus excelsior 1–2%',
      grade: 'FV',
    },
    logging: {
      inputs: { choice: 'few' },
      value: 'Ślady zrywki uszkadzającej runo; uszkodzone pojedyncze drzewa',
      grade: 'U1',
    },
    // W karcie z przewodnika: wartość „Brak”, a ocena U1 – przepisane bez zmian (podpowiedź formularza to FV).
    otherDistortions: { inputs: { choice: 'none' }, value: 'Brak', grade: 'U1' },
    keySpecies: { inputs: { choice: 'noData' }, value: 'Brak danych', grade: 'XX' },
  },
  prospects: {
    value:
      'W projekcie planu urządzenia lasu drzewostan przewidziany do zagospodarowania. Nie ma planów ingerencji w ciek. Naturalne procesy powinny stopniowo unaturalnić strukturę',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '-',
      intensity: 'M',
      description: 'Fragmentacja siedliska przez uprawę i utrzymywanie upraw świerkowych na części potencjalnego płatu siedliska',
    },
  ],
  threats: [
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      description: 'Planowa gospodarka leśna; zamieranie jesionów powodowane gradacją owadów',
    },
    {
      code: 'I01',
      name: 'Obce gatunki inwazyjne',
      description: 'Przenikanie gatunków obcych ze względu na dużą powierzchnię kontaktową',
    },
  ],
  other: {
    otherValues: 'Brak danych',
    conservation: 'Nie',
    notes:
      'Monitoring jest wymagany. Uzasadnienie: nietypowy skład florystyczny siedliska (gatunki charakterystyczne 91E0 i 9180) – wskazane jest monitorowanie tendencji dynamicznych siedliska. Propozycje działań ochronnych: wyłączenie z zagospodarowania jako las wodo- i glebochronny, stały monitoring naukowy. Udział powierzchni siedliska w stanie U1: 100%.',
    photos: [],
  },
  overallComment:
    'Wynika z ocen parametrów: powierzchnia U1 (ograniczona fragmentacja uprawami świerka), specyficzna struktura i funkcje U1 (wskaźniki kardynalne „Gatunki charakterystyczne”, „Gatunki dominujące” i „Martwe drewno >3 m i >50 cm” ocenione na U1), perspektywy ochrony FV. Cała powierzchnia siedliska na stanowisku w stanie U1.',
}

export const examples91E0 = [{ id: 'tomasowka-gorna', label: 'Tomasówka Górna', values: tomasowkaGorna }]
