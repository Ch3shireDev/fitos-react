# Specyfikacja karty 1330 – Solniska nadmorskie (Glauco-Puccinellietalia część – zbiorowiska nadmorskie)

Formularz wg przewodnika GIOŚ (Bosiacka 2012, cz. II, s. 72–84, tab. 1 i 2) z praktyką ocen z monitoringu 2017 i 2021.
Siedlisko niepriorytetowe – kod `1330`. Silnik wspólny (`src/7120`) i `src/forest` bez zmian; z `src/forest` tylko klocki
generyczne (`choiceIndicator`, `speciesCoverIndicator`, `pickField`). Rejestracja przez `meta.ts`.

Stanowisko: obszar z roślinnością halofilną izolowany innymi siedliskami lub infrastrukturą. Podtyp: 1330-1 (łąki i pastwiska),
1330-2 (półszuwary) albo mozaika. Transekt 200×10 m, może być nie po linii prostej. Zdjęcia: 3 domyślnie, 5×5 m.
Termin: czerwiec–wrzesień (ostrzeżenie poza oknem), nie rzadziej niż co 5 lat.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | trend + m² | rośnie/bez zmian FV, nieznaczny spadek U1, znaczny U2, brak danych XX |
| Udział procentowy siedliska na transekcie | % | ≥75 FV, 50–74,9 U1, <50 U2 |
| **Gatunki charakterystyczne** | lista z pokryciem | suma halofitów + „bazowych” indyferentnych (maks. 100): ≥40 FV, 20–39,9 U1, <20 U2; żadnego na liście U2 |
| **Gatunki dominujące** | lista dominantów z pokryciem | patrz niżej |
| Obce gatunki inwazyjne | lista z pokryciem | suma <10 FV, 10–25 U1, >25 U2 |
| **Rodzime gatunki ekspansywne** | lista z pokryciem | jak wyżej |
| Ekspansja krzewów i podrostu drzew | lista z pokryciem | suma <5 FV, 5–15 U1, >15 U2 |
| Struktura przestrzenna płatów | select | gradient/mozaika FV, częściowo U1, rozproszone i izolowane U2, brak siedliska U2 |
| **Zasilanie wodami słonymi** | select + źródło, rowy, lustro wody, ECe, przewodność wody, opis | swobodny FV, ograniczony U1, degradacja U2 |

## Interpretacje
- **Kardynalne** jak w przewodniku (charakterystyczne, dominujące, ekspansywne, zasilanie); sprawozdania 2017 i 2021 to potwierdzają (8 wskaźników, 4 kardynalne). W przeciwieństwie do 1310 nic nie wypadło – transekt i krzewy zostają.
- **Granice przedziałów** (75, 50, 40, 20%) – do lepszej klasy; przy „<10 / 10–25 / >25” i „<5 / 5–15 / >15” – dosłownie (10 i 25 to U1, 5 i 15 to U1).
- **„Bazowe” gatunki indyferentne** (tab. 1): mietlica rozłogowa, pięciornik gęsi, kostrzewa czerwona, ponikło jednoprzysadkowe. Rozdz. 4 przewodnika wrzuca kostrzewę czerwoną i ponikło do glikofitów – przyjęto tab. 1, bo to ona mówi o ocenie.
- **Gatunki charakterystyczne**: tab. 2 mówi o „pokrywaniu łącznej powierzchni płatów” – sumuje się pokrycie halofitów i bazowych, z sufitem 100%.
- **Gatunki dominujące** (tab. 2 opisowa): sumy pokrycia grup wśród wpisanych dominantów. Glikofity > halofitów i > indyferentnych → U2; halofity ≥ indyferentnych → FV; indyferentne przeważają, ale halofity mają ≥ połowę ich pokrycia i przeważają bazowe → współdominacja, FV; inaczej U1. Próg „połowy” to interpretacja dobrana tak, żeby przykład z przewodnika (mietlica 40, halofity 30 → FV) i praktyka 2021 (mietlica dominuje przy słabych halofitach → U1) się zgadzały. Gatunek spoza katalogu = glikofit.
- **Gatunki spoza grup przewodnika** ze zdjęć przykładowej karty (manna mielec, mięta wodna, turzyca dwustronna itd.) są w katalogu jako glikofity – nie są ani halofitami, ani wymienionymi gatunkami indyferentnymi.
- **Zasilanie**: przewodnik nie podaje progów ECe ani przewodności – pola są do zapisu pomiarów, bez ostrzeżeń (inaczej niż w 1310, gdzie progi były w sprawozdaniu).
- **Termin**: czerwiec–wrzesień jako suma okien z przewodnika (przed wypasem/1. pokosem – czerwiec, przed 2. pokosem – wrzesień, bez użytkowania – sierpień).
- **Kody oddziaływań**: słownik 2011 jak w innych kartach, lista z kodów użytych w sprawozdaniach 2017 i 2021.

## Przykład
Jarzębowo (ujście Dziwny, PLH320018), 19.07.2009, wykonawca „Jan Kowalski”. Wszystkie oceny FV jak w karcie.
„Struktury przestrzennej” w karcie nie ma → FV z opisu („wyraźny gradient zasolenia NW–SE”), tak też w 2017 r.
Olsza „pojedynczo” bez pokrycia → bez podpowiedzi, FV ręcznie. Kody 102 → A03, 140 → A04, 810 → J02.01.02.
