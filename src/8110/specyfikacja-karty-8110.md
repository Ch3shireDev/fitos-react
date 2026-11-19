# Specyfikacja karty 8110 – Piargi i gołoborza krzemianowe

Formularz karty obserwacji wg przewodnika GIOŚ (Stawowczyk, Kozłowska-Kozak, Kozak 2015, cz. IV, s. 196–210, tab. 1 i 2,
lista wskaźników kardynalnych, karta przykładowa „Dolina Pańszczyca 4”) z praktyką oceny ze sprawozdań z monitoringu
2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024). Przy rozjazdach podpowiedź idzie za tab. 2, a praktyka
trafia do pomocy i ostrzeżeń. Siedlisko niepriorytetowe, region alpejski (Tatry, Babia Góra) i kontynentalny
(Karkonosze, Śnieżnik Kłodzki). Karta rejestruje się sama przez `meta.ts`; `App.tsx`, strona główna, silnik `src/7120`
i `src/forest` – **bez zmian**.

Stanowisko: podtyp 8110-1…4 (wymagany), **pasmo górskie** (wymagane – od niego zależą progi gatunków), typ stanowiska,
obszar Natura 2000, obszary chronione, zarządzający, transekt 10 m × min. 100 m (ostrzeżenie poza; domyślnie 100×10,
w karcie 140×10), współrzędne początku, środka i końca, wysokość jako liczba albo zakres. Zdjęcia: 3 × 25 m² (ostrzeżenie
przy innej powierzchni). Termin: lipiec–sierpień bez ostrzeżenia, czerwiec i wrzesień – miękkie, poza – twarde. Inne
informacje: działania wykonywane i proponowane, „Monitoring jest wymagany” + uzasadnienie, udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | bez zmian FV, nieznaczny spadek U1, wyraźny U2 |
| Dominująca frakcja rumoszu | rozmiary + klasa (opcjonalnie) | opisowy: każda wartość FV; prawie same bloki >1 m U1 |
| Dominujące rodzaje zbiorowisk | opis + pokrycie kosodrzewiny + klasa | informacyjny: FV; kosodrzewina >50% U1 |
| **Gatunki typowe** | lista + liczba + „nie stwierdzono” + ocena | Tatry >7 FV, 4–7 U1, <4 U2; Karkonosze i Śnieżnik >2 / 1–2 / 0 |
| **Gatunki wysokogórskie** | lista + liczba + „nie stwierdzono” + ocena | Tatry >7 / 4–7 / <4; Karkonosze >2 / 1–2 / 0; Śnieżnik >1 / 1 / 0 |
| **Obce gatunki inwazyjne** | lista + liczba + pokrycie + „nie stwierdzono” | brak FV; 1 gat. <1% U1; ≥2 gat. albo 1 >1% U2 |
| Pokrycie przez drzewa i krzewy | lista + łączne + „nie stwierdzono” | <5 FV, 5–25 U1, >25 U2 |
| Pokrycie roślin zielnych | % | <50 FV, 50–90 U1, >90 U2 |
| Procent powierzchni siedliska na transekcie | % | >50 FV, 25–50 U1, <25 U2 |
| Ślady antropopresji | select + opis | brak/znikome FV, średnie U1, wyraźne negatywne U2 |

## Reguły ocen
- **Struktura – reguła silnika** (bez `structureRule`): tab. 2 mówi dokładnie to samo – kardynalne FV i pozostałe ≥U1 → FV;
  kardynalne ≥U1 → U1; kardynalny U2 → U2. Niekardynalne U1 (krzewy, zielne, procent powierzchni) nie obniżają struktury –
  tak jak w sprawozdaniach.
- **Ocena ogólna – silnik** („najgorszy decyduje”) – identyczna z wierszem tab. 2.

## Rozjazdy metodyki (krótko)
- **Pasmo a progi**: tab. 2 ma progi dla Tatr, Karkonoszy i Śnieżnika Kłodzkiego. Babii Góry (podtyp 8110-4, dodany
  w 2014 r.) i Bieszczadów nie wymienia – formularz stosuje progi tatrzańskie (region alpejski) i ostrzega, gdy wynik
  jest poniżej FV. W 2024 r. Żleb Poszukiwaczy Skarbów (Babia Góra) z 7 gatunkami typowymi dostał FV (progi tatrzańskie:
  U1). Bez pasma progi idą z podtypu (8110-3 → Sudety; dla wysokogórskich tylko gdy progi Karkonoszy i Śnieżnika dają to
  samo). Niezgodność podtypu i pasma – ostrzeżenie.
- **Gatunki typowe**: katalog = pkt 4 przewodnika dla czterech podtypów + 19 gatunków z karty przykładowej + gatunki
  wymieniane jako typowe w sprawozdaniach 2018 i 2024 (gęsiówka alpejska, goryczka kropkowana, boimka, gnidosze, rozchodnik
  alpejski, lepnica bezłodygowa, borówka halna). Lista wspólna dla podtypów (karta liczy razem 8110-1 i 8110-2). Rodzaje
  „spp.” (Racomitrium, Lecanora, Rhizocarpon, Umbilicaria) łapią gatunki rodzaju. Trzcinnik owłosiony – wymieniony w 2018 r.
  wśród „typowych”, ale to gatunek traworośli – nie liczy się.
- **Gatunki wysokogórskie**: przewodnik nie daje listy (ekspert ocenia sam). Katalog = 43 gatunki z karty + gatunki
  liczone w Sudetach w 2024 r. Gatunki spoza katalogu liczą się (decyzja eksperta). Gatunki, których karta nie liczy jako
  wysokogórskich (śmiałek pogięty, wroniec, podbiałek alpejski, urdzik karpacki…), są pomijane z ostrzeżeniem – podbiałek
  w 2024 r. w Karkonoszach liczono.
- **Frakcja rumoszu i zbiorowiska**: tab. 2 daje tylko FV albo wyjątkowo U1. Pod Śnieżnikiem 2018 oba dostały U2
  (siedlisko zadeptane) – formularz ma tę opcję oznaczoną „poza tab. 2” i ostrzega przy jej wyborze.
- **Krzewy**: tab. 2 przy dokładnie 5% daje U1, sprawozdania „do 5%” oceniały na FV – ostrzeżenie.
- **Obce**: dokładnie 1% (luka) i gatunek bez pokrycia → U1. Nigdy nie stwierdzone.
- **Pokrycie roślin zielnych**: przypis do tab. 2 mówi, że to wskaźnik opisowy, ale tab. 2 daje progi i sprawozdania je
  stosowały – formularz też (niekardynalny). Przy 8110-1 i ≥50% – ostrzeżenie o podtypie.
- **Ślady antropopresji**: pojedyncze śmieci nie obniżają oceny (Tatry, Babia Góra – FV), w Karkonoszach śmieci dawały U1.
  Formularz: wybór klasy wg skali, praktyka w pomocy.
- **Propozycje z 2018 r.** (usunąć frakcję, zbiorowiska, wysokogórskie i procent powierzchni; progi zielnych 50/75%;
  kardynalne: krzewy i zielne zamiast wysokogórskich i obcych) – nie weszły, w 2024 r. oceniano po staremu. Tylko w pomocy.

## Przykład – Dolina Pańszczyca 4 (Tatry), 15.08.2013
Ekspert lokalny i dodatkowi eksperci zanonimizowani („Jan Kowalski”, „Anna Nowak, Piotr Wiśniewski”). **Wszystkie oceny
wskaźników, parametrów i ocena ogólna jak w karcie (wszystko FV)**, podpowiedź formularza przy każdym wskaźniku zgodna
z ekspertem, bez ostrzeżeń: 19 gatunków typowych i 43 wysokogórskie (wszystkie rozpoznane przez katalog), obce – brak,
krzewy 0%, zielne 10%, siedlisko 100% transektu, antropopresja – brak. Udział FV 100%.

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; pasmo „Tatry” wywiedzione z obszaru i podtypu; intensywność
oddziaływań „A” → H; „Zagrożenia: Stanowisko nie jest zagrożone” → X; data kontroli i uwagi metodyczne w uwagach.
