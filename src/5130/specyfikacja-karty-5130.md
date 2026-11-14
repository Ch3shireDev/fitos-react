# Specyfikacja karty 5130 – Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach

Formularz karty obserwacji wg przewodnika GIOŚ (Perzanowska 2012, cz. II, s. 268–281, tab. 1 i 2, przykładowa karta
Poradów) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021. Siedlisko zaroślowe, niepriorytetowe,
regiony alpejski i kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura liczona regułą
ogólną (bez `structureRule`). Z `src/forest` tylko generyczne klocki (`selectInput`, `speciesInput`, `pickField`,
`labelOf`, `byOption`, `gradeMap`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: fragment płatu murawy z zaroślami jałowca; transekt 200×10 m (ostrzeżenie, gdy nie 2000 m²; karta ma 20×100 m –
bez ostrzeżenia). Zdjęcia: 3 × 25 m² (początek, środek, koniec), Braun-Blanquet, warstwy A, B, C (D – mchy z katalogu).
Termin: czerwiec–lipiec (ostrzeżenie poza oknem; 2021 r. badano do 9.08). Powtarzanie co 6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ „brak danych” → XX) + powierzchnia tekstem + opis | z selecta; % na transekcie jako wskazówka |
| Powierzchnia zajęta przez siedlisko na transekcie | liczba albo zakres (%) + opis | >15 FV, 5–15 U1, <5 U2 (środek zakresu) |
| **Gatunki krzewów** | lista z pokryciem + ocena ekspercka + opis | patrz niżej |
| Wysokość krzewów (średnia) | liczba albo zakres (m) + max + opis | >0,8 FV, 0,2–0,8 U1, <0,2 U2 |
| Zwarcie krzewów w płacie | liczba albo zakres (%) + opis | 20–80 FV; 10–20 / 80–90 U1; <10 / >90 U2 |
| Struktura przestrzenna płatów zarośli | select + opis | z selecta |
| **Udział gatunków drzewiastych (powyżej 1,5 m wys.)** | klasa (opcj.) + zwarcie % (opcj.) + lista + „nie stwierdzono” | klasa > zwarcie > suma z listy: 0 FV, ≤20 U1, >20 U2 |
| **Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska** | lista (ok. 5) + liczba wprost + ocena + opis | ocena > liczba: ≥3 FV, 1–2 U1, 0 U2 |
| Gatunki ekspansywnych roślin zielnych | lista + „nie stwierdzono” + ocena + opis | z oceny; „nie stwierdzono” → FV |
| Stan zdrowotny jałowców | select (opcj.) + opis | z selecta; liczy się tylko w zestawie „karta 2010” |
| Odnowienie jałowców (obecność nalotu) | select + opis | z selecta |
| Obce gatunki inwazyjne | lista z pokryciem + liczebność + liczba wprost + „nie stwierdzono” | 0 FV; 1 gat. U1; >1 gat. albo masowo U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Parametr „Powierzchnia siedliska”** – jak w 3240: tab. 2 ma wiersz „powierzchnia zajęta przez siedlisko na stanowisku”
  mieszający trend i ary/procenty, a karta przykładowa i sprawozdania mają osobno parametr (0,1 ha FV) i wskaźnik struktury
  „Procent powierzchni zajęty przez siedlisko na transekcie” (30–40% FV). Parametr = trend (select), progi procentowe
  (>15 / 5–15 / <5%) – przy wskaźniku na transekcie.
- **Zestaw wskaźników**: tab. 1–2 i monitoring 2016, 2021 – 10 wskaźników struktury. Karta przykładowa i monitoring
  2009–2010 – 11, z „Stanem zdrowotnym jałowców” (bez progów w tab. 2). Pole „Zestaw wskaźników struktury” w Stanowisku,
  **domyślnie tab. 2**; stan zdrowotny wtedy zostaje w karcie, ale silnik go pomija (`excluded`, mechanizm z 91E0). Schemat
  wymaga dla niego wartości i oceny – przy tab. 2 wpisuje się np. „nie oceniano” i XX (pomoc to mówi).
- **Stan zdrowotny – progi**: z opisu w sprawozdaniu 2009–2011 (dobry stan / zasychanie części krzewów / znaczna część).
- **Gatunki krzewów** (tab. 2 opisowa, liczb brak): U2 – brak jałowca, tarnina ≥50%, krzewy mezofilne (bez czarny,
  trzmielina, ligustr, kalina koralowa, kruszyna, leszczyna, ałycza) przy typowych łącznie <10%; U1 – jałowiec <5%, tarnina
  ≥25%, niepełny zestaw sześciu rodzajów (jałowiec, dereń świdwa, róża, głóg, tarnina, szakłak; róże i głogi po rodzaju);
  FV – pełny zestaw. To litera „pełnego zestawu” i daje U1 dla Poradowa jak w karcie (brak głogu i szakłaka). Praktyka bywa
  luźniejsza (Kopieniec: jałowiec + róża = FV) – stąd pole oceny eksperckiej z pierwszeństwem. Propozycja 2016–2018
  („≥3 gatunki typowe” = FV) nie weszła do metodyki – dałaby Poradowowi FV.
- **Granice**: udział 5 i 15% → U1; wysokość 0,8 i 0,2 m → U1; zwarcie 20 i 80% → FV, 10 i 90% → U1; drzewa 20% → U1
  (2021: „15–20% na granicy” → U1). Zakresy („0,8–1”, „15–20”) – podpowiedź ze środka.
- **Drzewa – „pojedyncze osobniki”**: karta daje U1 przy czereśni <1% + sośnie <1%, więc każde wpisane pokrycie >0 to U1;
  FV dla pojedynczych – wybierając klasę. Próg wysokości 1,5 m (tab. 2 i sprawozdania; tab. 1: „ok. 1,5–2 m”).
- **Gatunki charakterystyczne**: tab. 2 opisowa. Bez wybranej oceny: liczba gatunków (wprost albo z listy, katalog: Festuco-
  Brometea, Elyno-Seslerietea, Nardo-Callunetea) ≥3 FV, 1–2 U1, 0 U2. Dominację 1–2 gatunków ocenia ekspert. Wrzosowiska
  liczone (tab. 2 o nich zapomina – zarzut ze sprawozdania 2016–2018). Ostrzeżenie przy gatunkach muraw napiaskowych 6120
  (2021: 4 stanowiska z jałowcem na 6120 wskazane do usunięcia). Szałwia łąkowa (w karcie, spoza listy pkt 4) – w katalogu
  jako Festuco-Brometea.
- **Obce**: tab. 2: „pojedyncze lub w niewielkich kępach, jeden gatunek” U1; „więcej niż jeden gatunek, masowo lub w dużych
  płatach” U2 – formularz czyta „więcej niż jeden gatunek” jako wystarczające do U2. Masowo = pokrycie ≥10% (próg formularza)
  albo wybór. Wskaźnik **niekardynalny**. Synonimy (Conyza/Erigeron canadensis, Padus/Prunus serotina) liczone raz.
- **Ekspansywne**: bez progów pokrycia – ocena wybierana; „nie stwierdzono” → FV.
- **Udział powierzchni FV/U1/U2** (karta: przy ocenie ogólnej) – trzy liczby w „Innych informacjach”, jak w 2330 i 3240.
- **Kody oddziaływań**: słownik 2011 (sprawozdanie 2021: K02, K02.01, A04.03, A03.03, D01.01, G05.01, G01.02–G01.04, I01…).

## Przykład – Poradów, 8.06.2010
Ekspert zanonimizowany („Jan Kowalski”), zestaw „karta 2010”. **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak
w karcie**: powierzchnia FV (0,1 ha), udział 30–40% FV, krzewy U1, wysokość śr. 0,8–1 m FV, zwarcie 15–20% U1, struktura U1,
drzewiaste U1, charakterystyczne FV (5 gatunków), ekspansywne FV, stan zdrowotny U1, odnowienie FV, obce FV → struktura U1,
perspektywy U1, ogólna U1. Udział FV 30%, U1 65%, U2 5%. W zestawie tab. 2 wynik ten sam.

**Jedyna rozbieżność z tab. 2 (nie z kartą)**: odnowienie „Słabe, ale obecne” ekspert ocenił na FV, a tab. 2 mówi
„obecne, ale rzadkie” = U1. Ocena z karty zostaje, formularz pokazuje „odbiega od progów (U1)”. Na wynik nie wpływa
(wskaźnik niekardynalny, struktura i tak U1 przez kardynalne U1).

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; literówki w nazwach poprawione (Ligusticum → Ligustrum
vulgare, sanquinea → sanguinea, Sanquisorba, pumillum, Convulvulus, Pirus); wysokość B „max. 2,5 m, śr. 70 cm” → 0,7 m;
powierzchnia płatów 0,5 ha (dane stanowiska) i 0,1 ha (wskaźnik) – obie jak w oryginale, rozjazd opisany w uwagach.
Działalność: 950 Ewolucja biocenotyczna → K02, intensywność B → M, stary kod w opisie; zagrożenie (tekst) → K02.
Rok, typ monitoringu, „monitoring wymagany – tak” i uzasadnienie – w uwagach.
