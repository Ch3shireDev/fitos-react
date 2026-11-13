# Specyfikacja karty 1340 – Śródlądowe słone łąki, pastwiska i szuwary (Glauco-Puccinellietalia część – zbiorowiska śródlądowe)

Formularz wg przewodnika GIOŚ (Piernik 2010, tab. 1 i 2, przykładowa karta Owczary 2008) z praktyką ocen ze sprawozdań
z monitoringu 2014, 2016–2018 i 2024. Siedlisko **priorytetowe** – kod `*1340`. Silnik wspólny (`src/7120`) bez zmian.
Z `src/forest` tylko klocki generyczne (`choiceIndicator`, `speciesInput`, `listCover`, `pickField`). Rejestracja przez `meta.ts`.

Stanowisko: odizolowana powierzchnia ok. 0,2 ha lub więcej, zwykle mozaika kilku podtypów (pole „Podtypy siedliska”, 1340-1…1340-5).
Transekt: przewodnik nie narzuca wymiaru (Owczary: 15×145 m) – pole bez wartości domyślnej.
Zdjęcia: 3 domyślnie, 5×5 m. Termin: koniec maja – koniec września (ostrzeżenie poza oknem), raz na 3 lata.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | trend + ha | bez zmian/rośnie FV, inne U1, wyraźny spadek U2, brak danych XX |
| **Procent powierzchni na transekcie** | % albo długości odcinków | >75 FV, 50–75 U1, <50 U2 |
| **Gatunki charakterystyczne** | lista halofitów z pokryciem | ≥10 halofitów i obligatoryjny >25% FV; ≤6 U2; reszta U1 |
| **Gatunki dominujące** | lista gatunków ≥10% | żaden halofit >10% U2; halofity ≥ glikofity FV; reszta U1 |
| Obce gatunki inwazyjne | lista z pokryciem | <25 FV, 25–50 U1, >50 U2 |
| **Rodzime gatunki ekspansywne** | lista + maks. w płacie + „tylko 1340-3” | <25 FV, 25–50 U1, >50 lub płat >50% U2 |
| Ekspansja krzewów i podrostu drzew | select + opcjonalna lista | brak/pojedyncze FV, młodnik U1, nasadzenia/drzewostan U2 |
| Struktura przestrzenna płatów | select | mozaika/pasy FV, częściowo U1, płaty izolowane U2, brak siedliska U2, nie da się ocenić XX |
| **Zasilanie wodami słonymi** | select + źródło, ECe min/max, zasolenie wody, wody gruntowe, opis | swobodny FV, ograniczony U1, zanik U2; najwyższe ECe <4 dS/m → U2 |
| Uwilgotnienie | select | brak przesuszenia FV, przesuszenie powierzchniowe U1, wyraźne U2 |

## Interpretacje
- **Zestaw wskaźników**: 8 z tab. 2 przewodnika (5 kardynalnych, zgodnie z listą pod tab. 2 i sprawozdaniem 2016–2018) plus
  „Uwilgotnienie” – nie ma go w przewodniku, ale oceniano go w 2014 i 2024 r. (9 wskaźników w sprawozdaniu 2024). Dodany jako
  niekardynalny, progi U1/U2 wyprowadzone z opisów w sprawozdaniu. „Zachowanie strefy ekotonowej” i „Charakterystyczna kombinacja
  florystyczna” (tylko 2007–2008) pominięte.
- **Procent na transekcie**: w przewodniku „Udział procentowy siedliska na transekcie”, a progi w tab. 2 mówią o powierzchni stanowiska.
  Sprawozdania 2016–2024 liczą go na transekcie – tak robi formularz. Granice 75 i 50 należą do U1 (tab. 2: „powyżej 75%”, „50–75%”).
- **Gatunki charakterystyczne**: komórka FV tab. 2 („>9 gatunków, pokrywanie poszczególnych halofitów obligatoryjnych >25% (1–2 gatunki)”)
  czytana jako oba warunki naraz – ≥10 halofitów z obu list przewodnika i co najmniej jeden obligatoryjny >25%. U2: ≤6 halofitów.
  Liczą się tylko gatunki z list tab. 1; ostrzew rudy i babka nadmorska są w katalogu jako „halofit spoza listy” i się nie liczą.
- **Gatunki dominujące** (tab. 2 opisowa): U2, gdy żaden halofit nie przekracza 10%; FV, gdy łączne pokrycie halofitów wśród dominantów
  ≥ glikofitów („dominują lub współdominują”); reszta U1. Gatunek spoza katalogu = glikofit. „Udział typowy dla zespołu” (np. trzcina w 1340-3)
  zostaje ekspertowi – pomoc o tym mówi.
- **Obce i ekspansywne**: progi z tab. 2 dla 1340 (25/50%), nie 10/25% jak w 1310. Granice 25 i 50 – U1.
  Wyjątek z tab. 1 („udział trzciny >25% niewłaściwy, oprócz podtypu 1340-3”) jako przełącznik – trzcina pomijana tylko, gdy cały
  transekt leży w 1340-3. Przy mozaice podtypów (Owczary) liczona.
- **Zasilanie**: ECe jako dwa pola (najniższe/najwyższe z punktów). Gdy nawet najwyższe <4 dS/m → U2 (tab. 2). FV przy części punktów
  <4 dS/m – ostrzeżenie. Głębokość wód gruntowych jako tekst (przewodnik: do 1 m, bywa zakres „20–50”).
- **Struktura przestrzenna**: opcje „Siedliska nie stwierdzono” (U2, praktyka 2024) i „Nie da się ocenić” (XX, karta z Owczar – teren świeżo skoszony).
- **Kody oddziaływań**: słownik 2011 jak w innych kartach i w sprawozdaniu 2016–2018.

## Przykład
Owczary k. Buska-Zdroju, 31.05.2008, wykonawca „Jan Kowalski”; zarządzający terenem to instytucje (zostawione). Oceny jak w karcie:
powierzchnia U1, struktura U2 (trzcina 70% w ekspansywnych), perspektywy U1, ogólna U2. Pokrycia „<10%” wpisane jako 5%.
„Uwilgotnienia” w karcie nie ma → „Nie da się ocenić”, XX. Kody: 141 → A04.03, 930 → K01.04, 102 → A03, 970 → K04, 971 → K04.01, 890 → J02.15
(stare kody i intensywność A/B/C w opisach). Zagrożenia w karcie tylko tekstem – kody K04.01 i J02.15 przypisane przy przepisywaniu.
