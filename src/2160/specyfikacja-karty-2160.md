# Specyfikacja karty 2160 – Nadmorskie wydmy z zaroślami rokitnika

Formularz karty obserwacji wg przewodnika GIOŚ (Lemke 2012, cz. II, s. 85–92, tab. 1 i 2) z praktyką oceny ze sprawozdań
z monitoringu 2009–2011, 2015–2018 (badania 2016) i 2020–2021. Siedlisko nadmorskie, nieleśne, niepriorytetowe, skrajnie
rzadkie (rez. „Mewia Łacha” i okolice, rez. „Ptasi Raj”). Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest`
brane są tylko generyczne klocki (`selectInput`, `speciesInput`, `pickField`, `forestReleveFields`, `labelOf`).
Karta rejestruje się sama przez `meta.ts`.

Stanowisko: punktowe – obserwacja płatu (kępy) zarośli, bez transektu (płaty za małe). Jedno współrzędne: środek płatu.
Jedno zdjęcie fitosocjologiczne 5×5 m (25 m²), Braun-Blanquet, warstwy A–D. Termin: czerwiec–sierpień (ostrzeżenie poza).
Kontrola co 3–6 lat.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select (+ „bardzo mała” U1, „brak danych” XX) + ha + opis | z selecta; puste = ocena eksperta |
| Charakterystyczna kombinacja gatunków | lista + select + opis | z selecta; ostrzeżenie bez rokitnika |
| **Gatunki ekspansywne drzew i krzewów** | lista + select + opis | z selecta |
| Wysokość krzewów (średnia) | m albo klasa + rozpiętość | >2 FV, 1–2 U1, <1 U2 |
| Odnowienie naturalne rokitnika | select + opis | z selecta |
| **Powierzchnia kępy** | m² albo klasa + opis | >100 FV, 50–100 U1, <50 U2 |
| **Stan zdrowotny krzewów rokitnika** | % uszkodzonych pędów albo klasa + opis | ≤10 FV, ≤50 U1, >50 U2 |
| Ekspansywne gatunki obce w podszyciu i runie | lista + select + opis | z selecta |

## Interpretacje i dopowiedzenia
- **Kardynalne**: lista pod tab. 2 – gatunki ekspansywne roślin drzewiastych, stan zdrowotny, powierzchnia kępy.
- **Ocena struktury**: reguła silnika (kardynalny U1 → struktura co najmniej U1). Sprawozdanie 2021 mówi wprost:
  „obniżenie oceny któregoś ze wskaźników kardynalnych skutkuje obniżeniem oceny całego parametru”; sprawozdanie
  2009–2011 tak liczyło („Mewia Łacha” 1: wszystko FV poza ekspansywnymi U1 → struktura U1). Przykład z przewodnika
  i stanowisko „Mewia Łacha” 1 w 2016 dostały jednak FV przy ekspansywnych U1 – to niespójność źródeł, formularz
  trzyma się reguły (patrz „Przykład”).
- **Powierzchnia siedliska**: tab. 2 nie podaje progów. Opcje z ogólnych zasad (stabilna FV, spadek U1/U2, brak danych XX)
  plus **dopisana** opcja „stabilna, ale bardzo mała – pojedyncze niewielkie kępy” → U1: sprawozdanie 2009–2011 obniżało
  parametr „głównie z powodu zbyt małej powierzchni” (U1 na 3 z 4 stanowisk), przykład z przewodnika – U1 przy 0,02 ha.
  Nasadzenia (Hel, Kuźnica, Jastarnia, Mechelinki, Sopot) to nie 2160 – w 2021 U2 „z powodu braku siedliska” (w pomocy).
- **Wysokość / powierzchnia kępy**: granice „1–2 m” i „50–100 m²” domknięte – równo 2 m i równo 100 m² to U1, 1 m i 50 m² też U1.
- **Stan zdrowotny**: w tab. 2 przy FV stoi samo „10%” – czytane jako „do 10%”. „Pędy się regenerują” (U1) zostaje w opisie
  klasy; liczba >10% i ≤50% daje U1 bez sprawdzania regeneracji.
- **Gatunki ekspansywne**: przy U2 w tab. 2 „kępy zagrażające trwałości zarośli wierzby piaskowej” – pozostałość z innego
  siedliska, czytane jako zarośla rokitnika. Lista z tab. 1 (sosna, wierzba wawrzynkowa, wierzba ostrolistna, osika,
  brzoza, róża pomarszczona) uzupełniona ze sprawozdania 2021 o wierzbę kruchą, leszczynę i klon zwyczajny.
- **Gatunki obce**: lista ze sprawozdań (róża pomarszczona, wierzba ostrolistna, niecierpek drobnokwiatowy, nawłoć późna).
  Sprawozdanie 2021 dało FV przy róży 3–5% i wierzbie 1–2% („sporadycznie”) – wbrew tab. 2 (FV = brak); formularz trzyma
  się tabeli. Róża i wierzba ostrolistna są jednocześnie „ekspansywne” i „obce” – liczą się w obu wskaźnikach.
- **Kombinacja gatunków**: 7 gatunków z tab. 1/2 (groszek nadmorski, turzyca piaskowa, jasieniec, kostrzewa czerwona,
  bodziszek cuchnący, pokrzywa, trzcina) + rokitnik. Lista otwarta („takie jak”) – inne gatunki wydmowe pasują, ale do
  licznika się nie liczą. Ocena z selecta (tab. 2 operuje ilościowością, nie liczbą gatunków). Nazwa SI MGSP/sprawozdań:
  „Gatunki charakterystyczne” / „Charakterystyczna kombinacja florystyczna”.
- **Katalog**: Hippophaë rhamnoides rozpoznawany także bez „ë”. Wszystkie 56 pozycji zdjęcia z przykładu są w katalogu.
- **Termin**: przewodnik czerwiec–sierpień; przykład (16.09.2010) i cykl 2016 – wrzesień → formularz ostrzega, nie blokuje.
- **Kody oddziaływań**: lista 2011 jak w sprawozdaniu 2016 (I01, J02.04, K02.01, K04, K04.01) + umacnianie brzegu
  (J02.12.01, z rozdz. „Ochrona”), zalesianie wydm (B01, sprawozdanie 2010), dojścia na plażę (G01.02, G05.01, D01.01;
  2021), erozja i sztorm (K01.01, L07; 2010, 2021), I02, X.

## Przykład
„Mewia Łacha” 1, Ostoja w Ujściu Wisły, 16.09.2010, wykonawca „Jan Kowalski”. Wartości wskaźników przepisane słowo
w słowo, oceny wskaźników jak w karcie: powierzchnia siedliska U1, ekspansywne U1, reszta FV; perspektywy U1; **ocena
ogólna U1 – jak w karcie**. **Struktura wychodzi U1, w karcie FV** (kardynalny „Gatunki ekspansywne” U1 – patrz wyżej;
tak samo jak w karcie 1230). Liczby tam, gdzie karta je podaje: 0,02 ha, ok. 150 m² (FV), 0% uszkodzeń. Wysokość „2–5 m”
→ klasa „>2 m”. Współrzędne ucięte w przewodniku do minut – przepisane do minut. „Działalność człowieka: brak” → brak
oddziaływań. Nazwa obszaru, data wypełnienia i udział FV/U1/U2 (0/100/0%) – w uwagach. Zdjęcie: A 25%/8 m, B 70%/4 m,
C 30%/30 cm, D 0%, 56 pozycji.
