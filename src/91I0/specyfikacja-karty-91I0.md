# Specyfikacja karty *91I0 – Ciepłolubne dąbrowy (Quercetalia pubescenti-petraeae)

Formularz karty obserwacji wg przewodnika GIOŚ (rozdz. 91I0, tab. 1 i 2). Silnik wspólny z 7120/91D0 (`src/7120`),
wskaźniki leśne z modułu `src/forest` (wspólny dla 91D0, 91E0, 91F0, 91I0, 91P0).

## Pliki
| Plik | Zawartość |
|---|---|
| `src/91I0/Card91I0.tsx` | `<HabitatCardForm methodology={methodology91I0} examples={examples91I0} />` |
| `src/91I0/habitats/methodology.ts` | 16 wskaźników, progi, pomoc |
| `src/91I0/habitats/species.ts` | katalog gatunków z grupami (Quercetalia, okrajkowe/murawowe, Molinion, zacieniające, obce…), podtypy |
| `src/91I0/habitats/examples.ts` | Zimna Woda 1 (przykład z przewodnika), zanonimizowany |
| `*.test.ts(x)` | testy metodyki i formularza |

## Stanowisko
Pola leśne (`forestSiteFields`) + **Podtyp siedliska** (91I0-1 / -2 / -3, wymagany). Transekt 200×20 m, 3 zdjęcia po 400 m².
Termin optymalny: połowa czerwca – połowa sierpnia (ostrzeżenie poza nim).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Podpowiedź |
|---|---|
| Powierzchnia siedliska | select: nie zmienia się / inne / wyraźny spadek |
| Udział siedliska na transekcie | ≥80 FV, ≥50 U1, <50 U2 |
| **Gatunki charakterystyczne** | Quercetalia ≥5% lub ciepłolubne >10% → FV; w 91I0-1 dodatkowo wymagany Molinion; brak Quercetalia i ciepłolubne <1% → U2; reszta U1 |
| Gatunki dominujące | select; ostrzeżenie przy gatunkach zacieniających ≥25% i „naturalne” |
| **Obce gatunki inwazyjne w runie i podszycie** | brak FV, ≤5% U1, >5% U2 |
| Rodzime gatunki ekspansywne | brak FV, ≤20% U1, >20% U2 |
| **Gatunki ciepłolubne** | suma: ciepłolubne charakterystyczne (z wskaźnika wyżej) + pozostałe; >20 FV, ≥1 U1, <1 U2 |
| Leżące martwe drewno | % zasobności: ≤5 FV, ≤20 U1, >20 U2 (więcej = gorzej) |
| Wiek drzewostanu | średni wiek: >50 FV, 40–50 U1, <40 U2 |
| **Zwarcie podszytu** | ≤20 FV, ≤50 U1, >50 U2 |
| **Zwarcie koron drzew** | 50–70 FV; >70 jedna warstwa U1; >70 dwie warstwy lub <50 U2 |
| Gatunki obce geogr. i ekol. w drzewostanie | brak FV, ≤10% U1 („znikomy” – interpretacja), >10% U2 |
| Naturalne odnowienie | select; ostrzeżenie, gdy „dębowe”, a dębu brak, albo gatunki grądowe ≥10% |
| Obecność nasadzeń drzew | select |
| Zniszczenia runa i gleby (pozyskanie) | select |
| Zniszczenia drzewostanów | select, procent tylko opisuje |

## Zmiana w silniku
`IndicatorContext.indicators` – wskaźnik widzi pomiary pozostałych wskaźników (StatusTable je podaje). Potrzebne,
bo „Gatunki ciepłolubne” sumują się z listą gatunków charakterystycznych i odwrotnie.

## Przykład
Zimna Woda 1 (rezerwat Dąbrowa Grotnicka, 14.08.2007, 91I0-1). Podpowiedzi formularza zgadzają się z ocenami eksperta
we wszystkich 16 wskaźnikach. Karta z przewodnika podaje strukturę i ocenę ogólną FV, ale kardynalny wskaźnik inwazyjnych
ma U1, więc wg reguły z tab. 2 wychodzi U1 – formularz liczy wg reguły. Wykonawca: Jan Kowalski.
