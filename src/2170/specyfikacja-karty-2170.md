# Specyfikacja karty 2170 – Nadmorskie wydmy z zaroślami wierzby piaskowej

Formularz karty obserwacji wg przewodnika GIOŚ (Lemke 2012, cz. II, s. 93–101, tab. 1 i 2) z praktyką oceny ze sprawozdań
z monitoringu 2009–2011 (badania 2010), 2016 i 2021. Siedlisko nadmorskie, nieleśne, niepriorytetowe.
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `forestReleveFields`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko punktowe: jeden płat (kępa) zarośli, jedno zdjęcie fitosocjologiczne 5×5 m (25 m²), Braun-Blanquet,
wierzba w warstwie B. Termin: czerwiec–sierpień (ostrzeżenie poza). Monitoring co 3–6 lat.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | m² + select trendu + opis | gorsza z: wielkość płatu (>100 FV, 50–100 U1, <50 i 0 U2) i trend |
| Charakterystyczna kombinacja gatunków | lista + select + opis | z selecta; ostrzeżenia (brak wierzby, ekspansywne na liście) |
| **Gatunki ekspansywne drzew i krzewów** | lista + select + opis | brak FV; pojedyncze egzemplarze U1; kępy zagrażające U2 |
| Wysokość krzewów (średnia) | średnia m, rozpiętość od–do, klasa | >1 m FV; 0,2–1 m U1; <0,2 m U2 |
| Odnowienie naturalne wierzby piaskowej | select + opis | z selecta |
| **Powierzchnia kępy** | m² albo klasa + opis | >100 FV; 50–100 U1; <50 U2 |
| **Stan zdrowotny krzewów wierzby piaskowej** | % uszkodzonych pędów terminalnych albo klasa + opis | ≤10% FV; ≤50% U1; >50% U2 |

## Interpretacje (dopowiedzenia spoza metodyki)
- **Powierzchnia siedliska**: przewodnik nie daje progów. Praktyka 2016 (podsumowanie) i 2021: kępy <100 m² stabilne → U1,
  duże stabilne → FV, <50 m² → U2, zanik → U2 – czyli progi „Powierzchni kępy”. Trend (spadek: ocienianie, zasypywanie)
  może obniżyć ocenę; liczy się gorsza z dwóch. „Brak danych do porównania” nie obniża. Daje U1 dla karty z przewodnika
  (50 m², areał stabilny).
- **Granice**: 1 m i 0,2 m w wysokości → U1; 50 i 100 m² → U1; 10% uszkodzeń → FV, 50% → U1 (tab. 2 „do 10%”, „do 50%”).
- **Wysokość bez średniej**: liczona ze środka rozpiętości (karta podaje „1–1,5 m” → 1,25 → FV).
- **Stan zdrowotny**: tab. 2 przy U1 dopisuje „pędy się regenerują”; przypadek 10–50% bez regeneracji nie jest opisany –
  formularz daje U1 i radzi w pomocy rozważyć U2.
- **Gatunki ekspansywne**: tab. 2 daje U1 za „pojedyncze egzemplarze”, ale karta z przewodnika i sprawozdania 2010/2021
  dają FV przy pojedynczych starych sosnach w sąsiedztwie, które nie ocieniają kępy („brak lub sporadyczne występowanie”).
  Formularz nie zgaduje – opisane w pomocy; przy „Brak” z niepustą listą bez opisu jest ostrzeżenie.
- **Nazwy**: etykiety z przewodnika (tab. 1 i karta). SI MGSP: „Charakterystyczna kombinacja florystyczna”, „Gatunki
  ekspansywne” (2010: „Gatunki charakterystyczne”, „Gatunki ekspansywne roślin drzewiastych”) – podane w opisach.
  Wskaźniki z 2010 „Negatywne wpływy z otoczenia” i „Występowanie abrazji” pominięte – usunięte z metodyki w 2016.
- **Gatunki typowe**: 8 z tab. 1 (wierzba piaskowa + 7 gatunków wydm białych i szarych) z odmianami. „Salix acutiformis”
  w tab. 1 to literówka – rozpoznawana jako Salix acutifolia. Przymiotno kanadyjskie (2016) w katalogu jako obcy.
- **Zwarcie C**: pole tekstowe, bo karta ma „<5%”. Pozostałe warstwy liczbowe.
- **Pola stanowiska**: dodane „Nazwa obszaru” (Natura 2000) i „Data wypełnienia” – są w karcie z przewodnika.
  Współrzędne: jeden punkt (środek płatu), bez początku/końca transektu.
- **Kody oddziaływań**: lista 2011, jak w sprawozdaniach 2016 i 2021.

## Przykład
„Helskie Wydmy” 1, 15.09.2010, wykonawca „Jan Kowalski”. Oceny wskaźników jak w karcie: powierzchnia U1, kombinacja FV,
ekspansywne FV, wysokość FV, odnowienie U2, kępa U1, stan zdrowotny FV; perspektywy U1; **ocena ogólna U1 – jak w karcie**.

**Rozbieżność:** karta z przewodnika ma strukturę **FV**, formularz liczy **U1**. Kardynalna „Powierzchnia kępy” = U1 (ok. 50 m²),
a reguła z tab. 2 (każdy kardynalny poniżej FV obniża parametr) daje U1. Karta z 2010 r. tę regułę łamie; sprawozdania 2016
i 2021 ją stosują („obniżenie oceny któregoś ze wskaźników kardynalnych skutkuje obniżeniem oceny całego parametru”;
„głównym wskaźnikiem ograniczającym była zbyt mała powierzchnia kępy”). Wymuszenie FV wymagałoby zmiany silnika
(`aggregateStructure`) albo fałszowania oceny kępy – świadomie nie. Ocena ogólna wychodzi tak samo (U1).

Inne poprawki przy przepisywaniu: współrzędne ucięte do minut; w zdjęciu „N 50° 18' – E 16° 26'” (Kotlina Kłodzka)
zamienione na współrzędne stanowiska; „wysokość warstw: d 1 m” przepisane jako B = 1 m (d = brak); kod 622
„Turystyka piesza” → G01.02, intensywność B → M (stary kod zapisany w uwagach); udział powierzchni FV 0% / U1 100% / U2 0%
w uwagach. Data 15.09 jest poza czerwcem–sierpniem – formularz pokazuje ostrzeżenie (nie blokuje).
