# Specyfikacja karty 6110 – Skały wapienne i neutrofilne z roślinnością pionierską (Alysso-Sedion)

Formularz karty obserwacji wg przewodnika GIOŚ (Świerkosz, Szczęśniak, Reczyńska 2010, cz. I, s. 95–105, tab. 1 i 2,
karta Wapniarka 2008), z modyfikacją metodyki z 17.07.2015 (usunięte „Ocienienie muraw”) i praktyką oceny ze sprawozdań
2006–2008, 2013–2014, 2015–2018 i 2024. Siedlisko niepriorytetowe, tylko region kontynentalny. Silnik wspólny (`src/7120`)
i `src/forest` – **bez zmian**; struktura liczona regułą ogólną (bez `structureRule`), ocienienie wyłączane mechanizmem
`excluded` (z 91E0). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: grupa płatów na półkach skalnych odległych najwyżej o 50 m. Transekt zwykle niemożliwy – pole „Wymiary
transektu” jest opisowe, bez wartości domyślnej i bez ostrzeżenia o wymiarach. Jedno pole współrzędnych (jak w karcie).
Zdjęcia: 3 (po jednym na płat), bez narzuconej powierzchni (karta: 2 i 4 m²), warstwy A–D, plus „Uwagi do zdjęcia”
(płat niedostępny). Termin: maj–lipiec (ostrzeżenie poza oknem), opcjonalne pole drugiej kontroli (przewodnik każe
badać dwa razy: przełom V/VI i VII). Cykl 2–3-letni.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ „brak danych” → XX) + powierzchnia tekstem + opis | z selecta |
| Udział procentowy siedliska na transekcie | liczba/zakres + „Nie wykonano transektu” | 100–70 FV, 70–40 U1, <40 U2; brak transektu → XX |
| **Gatunki charakterystyczne** | lista z pokryciem + liczba wprost + „nie stwierdzono” | ≥4 FV, 2–3 U1, 0–1 U2 |
| **Gatunki dominujące** | lista (≥10%) + ocena ekspercka | wszystkie zgodne z tab. 1 FV, część U1, żaden U2 |
| Obce gatunki inwazyjne | lista + łączne pokrycie + „nie stwierdzono” | 0 FV, ≤2% U1, >2% U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + łączne pokrycie + „nie stwierdzono” | 0 FV, ≤5% U1, >5% U2 |
| Struktura przestrzenna płatów siedliska | select mozaiki + opis | z selecta |
| **Ekspansja krzewów i podrostu drzew** | lista + zwarcie B+A wprost + „nie stwierdzono” | 0 FV, ≤30% U1, >30% U2 |
| **Ocienienie muraw** (tylko zestaw „Przewodnik 2010”) | % + opis | ≤10 FV, ≤20 U1, >20 U2 |
| Zniszczenia mechaniczne | rodzaj (brak / naturalne / antropogeniczne) + % + opis | brak i naturalne FV; antrop. ≤20 U1, >20 U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Zestaw wskaźników**: modyfikacja z 17.07.2015 usunęła „Ocienienie muraw” – domyślnie 8 wskaźników struktury, 4
  kardynalne. Przewodnik, karta Wapniarka **oraz – wbrew modyfikacji – sprawozdania 2018 i 2024** liczyły 9 wskaźników
  i 5 kardynalnych (2024: „na 2 stanowiskach XX, na pozostałych ekspercko”). Pole „Zestaw wskaźników struktury”
  w Stanowisku: `mod2015` (domyślny) albo `guide2010`. Przy `mod2015` ocienienie zostaje w karcie, ale silnik je pomija.
- **Gatunki charakterystyczne**: katalog = lista z tab. 1 (rojownik, wiechlina spłaszczona, rogownica drobna,
  smagliczka, czyścica, ożanka, rozchodniki: ostry, ościsty, sześciorzędowy, wielki, biały, skalnica trójpalczasta,
  czosnek skalny). Synonimy liczone raz. Gatunki typowe (krwiściąg mniejszy, macierzanka, driakiew, kostrzewa owcza,
  mchy) **nie są liczone** – sprawozdanie 2024 nazywa ich wcześniejsze liczenie (2013–2018) „zmianą pozorną”. Rozchodnik
  biały ma w tab. 1 „niejasny status (antropofit)” – liczony.
- **Gatunki dominujące**: tab. 2 jest opisowa. Za zgodne z tab. 1 formularz uznaje gatunki charakterystyczne plus dwa
  typowe dominanty nazwane w tab. 1: kostrzewę owczą i zęboróg purpurowy. Ostrzeżenie przy pokryciu <10% (karta każe
  wpisywać tylko ≥10%). Praktyka 2024 dawała U2 także przy „braku dominantów z pokryciem >25%” – to zostaje ocenie eksperta.
- **Granice**: udział 70% → FV, 40% → U1; obce 2% → U1; ekspansywne 5% → U1; krzewy 30% → U1; ocienienie 20% → U1.
- **Ocienienie – „brak lub słabe”**: liczby brak; formularz przyjmuje do 10% (sprawozdanie 2015–2018: na najlepiej
  ocenionych stanowiskach 0 – ok. 10%).
- **Zniszczenia mechaniczne**: tab. 2 ma lukę 10–20% (U1 „do 10%”, U2 „powyżej 20%”) – liczona do U1. Naturalne
  odrywanie głazów = FV (tab. 1: „naturalny składnik dynamiki”, karta Wapniarka FV).
- **Udział na transekcie, XX**: wskaźnik niekardynalny, więc XX nie obniża struktury (reguła ogólna).
- **Kody oddziaływań**: słownik 2011 (C01, K02, G05.01, G01.04, K04.05 – muflony, L05 – obrywy, M01.02, I01…).
  Sprawozdanie 2024 używa już nowego słownika (grupy A–X) – nie przenoszono.

## Przykład – Wapniarka, 28.08.2008
Koordynator i dodatkowy koordynator zanonimizowani („Jan Kowalski”, „Anna Nowak”), zestaw `guide2010`. **Wszystkie
oceny wskaźników, parametrów i ocena ogólna jak w karcie**: powierzchnia U1, udział XX (brak transektu),
charakterystyczne U2 (sama Poa compressa), dominujące U2 (Poa nemoralis 10%), obce FV, ekspansywne U1 (bylica 2%),
struktura płatów FV, ekspansja krzewów FV, ocienienie FV (2%), zniszczenia FV (naturalne) → struktura U2,
perspektywy U2, ogólna U2. W zestawie `mod2015` wynik ten sam.

**Jedyna rozbieżność z tab. 2 (nie z kartą)**: ekspansja krzewów – brzoza 1% + wierzba iwa 1% ekspert ocenił na FV, a tab. 2
daje FV tylko przy „brak” (do 30% → U1). Ocena z karty zostaje, formularz pokazuje „odbiega od progów (U1)”. Na wynik nie
wpływa (struktura i tak U2 przez kardynalne U2).

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; warstwy w zdjęciach nie podane – przyjęte z katalogu
(brzoza, iwa → B); zdjęcie III – „Brak możliwości wykonania zdjęcia” w uwagach do zdjęcia; literówki w mięczakach
poprawione (Charpentieria ornata, Helicigona lapicida). Działalność: 301 Kamieniołomy → C01, intensywność A → H, wpływ
„–/+” → „+” (siedlisko istnieje dzięki odsłoniętym ściankom), stary kod i wpływ w opisie; część „–” jako zagrożenie C01
„Planowane ponowne otwarcie kamieniołomu”. Rok, typ monitoringu, „monitoring wymagany – tak” i uzasadnienie – w uwagach.
Termin 28.08 jest poza oknem maj–lipiec – formularz ostrzega (świadomie, test to sprawdza).

## Rozjazdy metodyki (skrót)
1. Ocienienie: usunięte w 2015, oceniane dalej w 2018 i 2024 (jako kardynalne).
2. Ekspansja krzewów: tab. 2 „brak” = FV, karta przykładowa daje FV przy 2%, sprawozdanie 2018 – FV do ok. 5%.
3. Gatunki charakterystyczne: progi zaostrzone w 2010 (≥3 → ≥4 na FV); w 2013–2018 liczono gatunki typowe jako
   charakterystyczne, 2024 to prostuje.
4. Zniszczenia mechaniczne: luka 10–20% w tab. 2.
5. „Ocienienie – słabe” bez liczby.
6. Propozycje ze sprawozdania 2015–2018 (usunąć udział na transekcie i strukturę płatów, dodać „Pokrycie przez mszaki”,
   dominujące niekardynalne) – nie weszły do metodyki; w 2024 oceniano po staremu.
