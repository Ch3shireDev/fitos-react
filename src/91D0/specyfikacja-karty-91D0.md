# Specyfikacja karty *91D0 – Bory i lasy bagienne

Formularz karty obserwacji siedliska priorytetowego *91D0 według przewodnika GIOŚ (rozdz. 91D0, tab. 1 i 2).
Działa na tym samym silniku co karta 7120 (`src/7120/components/habitat-form`, `src/7120/habitats`). Obowiązują więc wszystkie zasady
z `src/7120/specyfikacja-karty-7120.md`: etykiety nad polami, popovery „?” otwierane nad przyciskiem, tryb dla początkujących,
tabela stanu ochrony z nagłówkami grup, wspólna kolumna ocen, wersja robocza w IndexedDB, potwierdzenia przed utratą danych, zapis do .zip,
eksport .docx i PWA offline.

## Pliki

| Plik | Zawartość |
|---|---|
| `src/91D0/Card91D0.tsx` | `<HabitatCardForm methodology={methodology91D0} examples={examples91D0} />` |
| `src/91D0/habitats/methodology.ts` | metodyka jako dane: pola, 17 wskaźników, progi, pomoc |
| `src/91D0/habitats/species.ts` | słownik gatunków, warianty siedliska, listy gatunków charakterystycznych |
| `src/91D0/habitats/examples.ts` | Reptowo XI, VIII, X (14.07.2025), zanonimizowane |
| `src/91D0/habitats/methodology.test.ts`, `src/91D0/Card91D0.test.tsx` | testy |

## Zmiany w silniku wspólnym (wprowadzone dla 91D0)

- `Methodology.priority` – kod siedliska w karcie i w .docx z gwiazdką (`habitatCode(m)` → `*91D0`).
- `IndicatorContext { site }` przekazywany do `suggest/explain/warn/describe` – wskaźnik widzi np. wariant siedliska.
- `cardinal` może być funkcją kontekstu; wszędzie używane `isCardinal(ind, site)` (ocena, tabela, .docx).

## Stanowisko

Pola jak w 7120 plus **Wariant siedliska** (select, wymagany):

| Wartość | Wariant | Lista gatunków charakterystycznych |
|---|---|---|
| `pineBog` | bór bagienny (sosnowy, także górski) | bagno, borówka bagienna, torfowce, żurawina, modrzewnica, wełnianka pochwowata |
| `birchBog` | brzezina bagienna | jak wyżej + widłak jałowcowaty, brzoza omszona |
| `spruceBog` | świerczyna bagienna | gwiazdnica długolistna, listera sercowata, torfowce, widłak jałowcowaty |
| `pineBirchBoreal` | borealny las sosnowo-brzozowy | brzoza omszona, zachylnik błotny, turzyca strunowa, bobrek, kruszczyk błotny, dziewięciornik, torfowce, żurawina, wełnianka pochwowata |

Wszystkie torfowce to jedna pozycja listy („Sphagnum spp.”). Termin optymalny: czerwiec–wrzesień (ostrzeżenie poza nim).
Zdjęcia fitosocjologiczne: 3 × 100 m² (domyślna powierzchnia 100).

## Wskaźniki (kolejność z karty)

Pogrubione = kardynalne.

| Wskaźnik | Dane | Podpowiedź oceny |
|---|---|---|
| Powierzchnia siedliska | select | FV nie maleje / U1 powolny spadek lub fragmentacja / U2 szybki spadek lub silna fragmentacja |
| **Gatunki charakterystyczne** | lista gatunków | udział listy wariantu: >60% FV, 30–60% U1, <30% U2; bez wariantu brak podpowiedzi |
| Gatunki dominujące | lista + select | z selecta; ostrzeżenie, gdy „naturalne”, a na liście ≥10% gatunku ekspansywnego/obcego/mchu borów świeżych |
| **Inwazyjne gatunki obce w runie** | lista | 0 FV; 1 gatunek ≤1% U1; więcej albo >1% U2 *(interpretacja)* |
| Rodzime gatunki ekspansywne | lista | 0 FV; 1 gatunek ≤25% U1; >1 gatunek albo >25% U2 *(interpretacja)* |
| **Uwodnienie** | select + opcjonalny poziom wody | z selecta; ostrzeżenie przy „właściwe” i wodzie >40 cm |
| Wiek drzewostanu | select + opcjonalne udziały | z selecta; ostrzeżenie, gdy liczby wskazują inną klasę |
| **Gatunki obce geograficznie w drzewostanie** | lista + „czy się odnawiają” | <1% FV, <10% U1, ≥10% albo odnawianie U2; liczy się każdy wpis (świerk bywa rodzimy) |
| Gatunki obce ekologicznie | lista | <10% FV, <30% U1, reszta U2 |
| Martwe drewno >3 m i 30 cm | select klasy + opcjonalna liczba/ha | liczba ma pierwszeństwo: >3 FV, 1–3 U1, <1 U2 |
| Naturalne odnowienie | select | obfite FV / pojedyncze U1 / brak U2 |
| Występowanie mchów torfowców | lista + select | z selecta; **kardynalny tylko przy `pineBog`**; ostrzeżenie przy „dominują” i pokryciu <10% |
| Charakterystyczne krzewinki | lista + select | z selecta; przy `spruceBog` i `pineBirchBoreal` XX (wskaźnik nie dotyczy) |
| Pionowa struktura | select | naturalna FV / zmieniona U1 / ujednolicona U2 |
| Zniszczenia po pozyskaniu drewna | select | brak FV / <1% U1 / >1% U2 |
| Inne zniekształcenia | select | brak FV / mało znaczące U1 / silne U2 |
| Gatunki kluczowe (fakultatywny) | select | FV / U1 / U2 / brak danych XX |

Progi oznaczone *interpretacja* to przełożenie opisowych progów przewodnika na liczby. Formularz tylko podpowiada, ocenę i tak wybiera ekspert.
Pomoc selectów wymienia opcje razem z oceną, którą dają.

## Przykłady

Reptowo XI, VIII, X (14.07.2025), wariant `pineBog`. Teksty „wartość lub opis” przepisane z karty, selekty ustawione zgodnie z ocenami eksperta.
Podpowiedzi formularza zgadzają się z ocenami z karty we wszystkich wskaźnikach. Wynik: powierzchnia FV, struktura U2, perspektywy U1, ogólna U2.

**Anonimizacja:** wykonawca „Jan Kowalski”, podpisy zdjęć „(fot. J. Kowalski)”. Test sprawdza, że w przykładach nie ma innego autora zdjęć.
Prawdziwe nazwisko z oryginalnej karty nie występuje w kodzie, testach ani dokumentacji.

## Testy

`npx vitest run` – 114 testów (w tym 29 dla 91D0).
