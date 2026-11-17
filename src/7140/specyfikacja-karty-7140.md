# Specyfikacja karty 7140 – Torfowiska przejściowe i trzęsawiska (przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae)

Formularz karty obserwacji wg przewodnika GIOŚ (Koczur 2012, cz. III, s. 109–122, tab. 1 i 2, lista wskaźników
kardynalnych, karta przykładowa „Chyżne Borcok”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania
2010–2011), 2015–2018 (badania 2016–2017) i 2023–2025 (badania 2024). Przy rozjazdach podpowiedź idzie za tab. 2,
a praktyka trafia do pomocy i ostrzeżeń. Siedlisko niepriorytetowe, region kontynentalny (7140-1) i alpejski (7140-2).
Karta rejestruje się sama przez `meta.ts`; `App.tsx`, strona główna, silnik `src/7120` i `src/forest` – **bez zmian**.

Wspólne z 7120: pola stanowiska (GUID, obszary chronione, wymiary transektu, wykonawca), pola zdjęć fitosocjologicznych
(warstwy A–D), pięć pól głębokości wody, sposób pozyskania torfu i „Inne informacje” – przez `pickField`.

Stanowisko: podtyp (opcjonalny), typ stanowiska, nazwa obszaru, zarządzający, transekt 10×200 m (dozwolone modyfikacje),
współrzędne początku, środka i końca, wysokość jako liczba albo zakres. Termin: lipiec – 15.08 bez ostrzeżenia, czerwiec
i 16.08–30.09 – ostrzeżenie miękkie, poza czerwcem – wrześniem – twarde. Inne informacje: propozycje działań, „Monitoring
jest wymagany” + uzasadnienie, udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | stabilna/rośnie FV, powolny ubytek U1, wyraźny spadek U2 |
| Procent powierzchni zajęty przez siedlisko | % + ocena (z XX) | ≥80 FV, 50–80 U1, <50 U2 |
| **Gatunki charakterystyczne** | lista z pokryciem, liczba i pokrycie wprost, ocena | >6 gat. albo pokrycie >50% FV; 0–3 i <20% U2; reszta U1 |
| Gatunki dominujące | lista z pokryciem + ocena | udział charakterystycznych w pokryciu dominantów ≥60 FV, 40–60 U1, <40 U2 (interpretacja) |
| **Pokrycie i struktura gatunkowa mchów** | pokrycie mchów, % torfowców, % mchów brunatnych | mchy >50 i torfowce >50 FV; mchy 20–50 albo torfowce ≤50 U1; mchy <20 U2 |
| **Obce gatunki inwazyjne** | lista + łączne + „nie stwierdzono” | brak FV, ≤5% (i bez pokrycia) U1, >5% U2 |
| **Gatunki ekspansywne roślin zielnych** | lista + łączne + „nie stwierdzono” + ocena | <1% (pojedyncze) FV, ≤5% U1, >5% U2 |
| Obecność krzewów i podrostu drzew | lista + łączne + „nie stwierdzono” | <1% FV, ≤15% U1, >15% U2 |
| **Stopień uwodnienia** | 5 pomiarów, piezometr, obserwacja | średnia ≤10 cm FV, ≤20 U1, >20 U2; piezometr > pomiary > obserwacja |
| Pozyskanie torfu | select (6 klas) + sposób + % zniszczonej powierzchni | z selecta |
| Melioracje odwadniające | select (5 klas) + opis | z selecta |

## Reguły ocen
- **Struktura – własna reguła z tab. 2** (`structureRule7140`): kardynalny U2 → U2; wszystkie kardynalne FV i pozostałe
  ≥U1 → FV; kardynalne ≥U1 i z pozostałych **maksymalnie dwa** U2 → U1. Trzy i więcej niekardynalnych U2 tab. 2 nie
  opisuje (kolumna U1 je wyklucza, kolumna U2 mówi tylko o kardynalnych) – formularz daje U2. To jedyna różnica
  względem reguły silnika.
- **Ocena ogólna – silnik** („najgorszy decyduje”), nie wiersz tab. 2 „wszystkie FV lub dwa FV i jeden U1 → FV” – jak
  w kartach 3140, 4060, 6130 (reguła sprzed erraty, sprawozdania jej nie stosują).

## Rozjazdy metodyki (krótko)
- **Gatunki charakterystyczne**: katalog = 38 gatunków z pkt 4 przewodnika + 4 gatunki klasy Scheuchzerio-Caricetea wg
  Matuszkiewicza 2001 (bobrek, bagniak błotny, gnidosz błotny, wierzbownica błotna), bo przewodnik podaje gatunki klasy
  „m.in.”. Pokrycie = suma pokryć (warstwy się nakładają, może przekroczyć 100%). Wełnianka pochwowata i żurawina –
  w pkt 4 wśród gatunków zespołów, ale „nie powinny decydować o klasyfikacji płatu”: liczą się, a gdy dają ponad połowę
  pokrycia – ostrzeżenie.
- **Gatunki dominujące**: tab. 2 bez liczb; progi 60/40% to interpretacja. Sprawozdania 2011 i 2017: przy dominacji
  wełnianki pochwowatej „oba podejścia są prawidłowe” – ostrzeżenie + ocena ekspercka.
- **Mchy**: waloryzacja z 2012 r. (wcześniej próg torfowców 70%). Tab. 2 przy braku torfowców i mchach ≥20% daje U1,
  a w 2024 r. przy zaniku torfowców oceniano U2 – formularz idzie za tab. 2 i ostrzega.
- **Ekspansywne**: „brak lub pojedyncze” = <1%. 2016–2018 stosowano ostrzej („tylko brak → FV”), postulat łagodniejszych
  progów z 2018 r. nie wszedł. Wełnianka pochwowata wpisana tutaj – liczy się, z ostrzeżeniem.
- **Krzewy**: dokładnie 15% (luka w tab. 2) → U1. Postulat z 2018 r. (kardynalny, progi 5/20%) – tylko w pomocy.
- **Obce**: 5% → U1; gatunek bez pokrycia → U1 (praktyka 2024: <1% → U1). Gatunki w otoczeniu, a nie w płatach, nie
  liczą się (krzywoszczeć 2011).
- **Uwodnienie**: tab. 2 podaje progi dla piezometru, pomiary terenowe uśredniane; bez pomiarów – opis z obserwacji
  („woda do podeszwy” FV, oznaki przesuszenia U1, wyraźne przesuszenie U2 – jak w 2024 r.).
- **Pozyskanie torfu**: tab. 2 daje FV tylko za dawne (>30 lat) i małe (≤5%) – zakończone w ostatnich 30 latach na małą
  skalę formularz daje U1 (luka).
- **Melioracje**: osobna opcja „Rowy tylko w otoczeniu, bez wpływu” (FV) – tak oceniła karta przykładowa.

## Przykład – Chyżne Borcok (Kotlina Orawsko-Nowotarska), 31.07.2011
Koordynator zanonimizowany („Jan Kowalski”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak w karcie
(wszystko FV)**, podpowiedź formularza przy każdym wskaźniku zgodna z ekspertem. Karta nie ma wskaźnika „Procent
powierzchni zajęty przez siedlisko” – w przykładzie XX (nie psuje struktury, bo niekardynalny). Jedyne ostrzeżenie:
płonnik pospolity wpisany przez eksperta do gatunków charakterystycznych – nie ma go na liście z pkt 4, formularz go nie
liczy (ocena i tak FV: 4 gatunki, pokrycie 136%).

Inne przeniesienia: kod „7140*” z gwiazdką w karcie – siedlisko nie jest priorytetowe; współrzędne ucięte – do minut;
podtyp 7140-2 wywiedziony z regionu; literówki „Ocycoccus”, „Vaccinum” poprawione; stare kody oddziaływań 161 → B01,
810 → J02.01.02, intensywność C → L; „Zagrożenia: Nie zaobserwowano” → X; rok i typ monitoringu w uwagach.
