# Specyfikacja karty 6130 – Murawy galmanowe (Violetalia calaminariae)

Formularz karty obserwacji wg przewodnika GIOŚ (Świerkosz, Reczyńska 2015, cz. IV, s. 167–181, tab. 1 i 2, przykładowa
karta Miedzianka) z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024).
Siedlisko niepriorytetowe, tylko region kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura
i ocena ogólna liczone regułą ogólną (bez `structureRule`). Z `src/forest` tylko generyczne klocki (`selectInput`,
`speciesInput`, `pickField`, `labelOf`, `byOption`, `gradeMap`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: grupa płatów muraw na hałdach odległych od siebie najwyżej o ok. 50 m; transekt o stałej długości zwykle
niemożliwy – pole „Wymiary transektu” opisowe, niewymagane. Pole **Region** (Rudawy Janowickie / Wyżyna Olkuska / Złoty Stok /
inne) wybiera regionalną listę gatunków typowych z tab. 1 (pkt b–d). Zdjęcia: 3 × 25 m² (ostrzeżenie poniżej 10 m²),
Braun-Blanquet, warstwy A–D (porosty i mszaki obowiązkowo). Termin: maj–wrzesień (ostrzeżenie poza), optimum czerwiec;
kontrola co 3 lata.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ „brak danych” → XX) + spadek % + powierzchnia + opis | select > spadek: 0 FV, ≤10% U1, >10% U2 |
| **Charakterystyczna kombinacja florystyczna** | lista z pokryciem + liczba wprost + ocena + opis | ocena > liczba/lista: 0 gat. albo łącznie ≤2% U2; ≥6 gat. FV; reszta U1 |
| Fizjonomia zbiorowiska roślinnego | select + wysokość (cm) + opis | z selecta; ostrzeżenie: FV przy murawie >50 cm |
| **Obce gatunki inwazyjne** | lista + łączne pokrycie + „nie stwierdzono” | 0 FV, ≤2% U1, >2% U2; gatunki bez pokrycia → U1 |
| **Gatunki synantropijne i nitrofilne** | lista + łączne pokrycie + „nie stwierdzono” | ≤1% FV, ≤5% U1, >5% U2; bez pokrycia → FV |
| Gatunki ekspansywne roślin zielnych | lista + „nie stwierdzono” + ocena | suma gatunków **spoza** typowej kombinacji (wg regionu): <10 FV, 10–30 U1, >30 U2 |
| **Występowanie krzewów i podrostu drzew** | lista + łączne pokrycie + „nie stwierdzono” | ≤10% FV, ≤30% U1, >30% U2 |
| Ślady wypasu | select + opis | z selecta |
| **Niszczenie i zaśmiecanie hałd** | select + opis | z selecta |

## Rozjazdy metodyki (krótko)
- **Ocena ogólna w tab. 2**: „wszystkie FV lub dwa FV i jeden U1 → FV; dwa lub trzy U1, brak U2 → U1”. Sprawozdania tego
  nie stosują (Armeria i Pleszczotka 2013 i 2018: FV / U1 / FV → U1) – formularz liczy regułą ogólną silnika, bez zmian.
- **Niszczenie i zaśmiecanie hałd**: tab. 2 daje U2 za każdy pobór kruszywa, a karta przykładowa („eksploatacja kruszywa na
  ok. 10% hałdy”) i praktyka 2024 („ślady pozyskiwania kruszywa”, Ciechanowice) – U1. Formularz podpowiada wg tab. 2,
  rozjazd pokazuje przy ocenie.
- **Obce**: kolumna U2 tab. 2 mówi „pojedynczo lub licznie (ponad 2%)”, U1 – „sporadycznie (≤2%)”. Formularz idzie za liczbą
  2%; gatunki bez pokrycia traktuje jak „sporadycznie” (U1), tak oceniano w 2024 r. pojedyncze osobniki.
- **Kombinacja florystyczna** – tab. 2 opisowa. Próg 6 gatunków (FV) wzięty z praktyki 2024 (FV ok. 10 gat., U1 – 5 gat.,
  U2 – 4 gat. pojedynczo); „kadłubowa… z pokryciem do 2%” czytane jako łączne pokrycie gatunków typowych ≤2%.
  Pole oceny eksperckiej z pierwszeństwem (przewodnik: płaty na podłożach ubogich bywają naturalnie ubogie).
- **Ekspansywne**: liczone są tylko gatunki spoza typowej kombinacji regionu (karta: mietlica i kostrzewa w Rudawach → FV;
  wrzos na hałdach arsenowych – typowy, na olkuskich – ekspansywny). Progi zmienione w 2015 r. (wcześniej 25–50 / >50%).
- **Jeżyny** – w 2018 r. liczone jako nitrofilne, w 2024 r. jako ekspansywne; katalog trzyma je przy ekspansywnych.
- **Ślady wypasu** – sprawozdania 2013–2014 i 2015–2018 proponowały rezygnację; w 2024 r. nadal oceniany, więc jest.
  Niszczenie hałd kardynalne od 2015 r. (propozycja zdjęcia z kardynalnych nie weszła).
- **Powierzchnia**: U1 „zmniejszona o 10%” – granica 10% liczona do U1.

## Przykład – Miedzianka (Rudawy Janowickie), 26–27.06.2012 i 7.07.2013
Eksperci zanonimizowani („Jan Kowalski”, „Anna Nowak”), region Rudawy. **Wszystkie oceny wskaźników, parametrów i ocena
ogólna jak w karcie**: powierzchnia U2, kombinacja FV (7 gatunków, ok. 56%), fizjonomia U2, obce U2 (rdestowce łącznie 5%),
nitrofilne U1 (2,5%), ekspansywne FV (tylko gatunki typowe), krzewy i podrost U1 (26,5%), wypas U2, niszczenie U1 →
struktura U2, perspektywy U2, ogólna U2. Udział FV 10%, U1 30%, U2 60%.

**Jedyna rozbieżność z tab. 2**: niszczenie – ekspert U1, tab. 2 U2 (pobór kruszywa). Na wynik nie wpływa: struktura i tak
U2 przez obce gatunki (kardynalny). Uwaga: kolumna „U2” obok FV kombinacji w karcie to scalona komórka oceny parametru
struktury rozcięta łamaniem strony, nie druga ocena wskaźnika.

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; data – ostatnia wizyta, wcześniejsze w uwagach; wysokości
warstw C i D z metrów na centymetry; zdjęcie I „płasko” → nachylenie 0; siewki drzew w warstwie C jak w karcie; literówka
Ceratodon „purpuraeus” poprawiona; intensywność A → H, B → M (zagrożenia: intensywność w opisie); I01 „Nierodzime gatunki
zaborcze” → nazwa ze słownika 2011; „Raport roczny” (rok, zagrożenia tekstem, monitoring wymagany, uzasadnienie) w uwagach.
