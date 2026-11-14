# Specyfikacja karty 4070 – Zarośla kosodrzewiny (Pinetum mugo)

Formularz karty obserwacji wg przewodnika GIOŚ (Mróz 2010, cz. I, s. 84–94, tab. 1 i 2, przykładowa karta Sokolica)
z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021. Siedlisko zaroślowe piętra subalpejskiego,
niepriorytetowe, regiony alpejski i kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; reguła
struktury z tab. 2 jest identyczna z ogólną, więc `structureRule` (z 3260) nie jest potrzebne. Karta rejestruje się sama
przez `meta.ts`.

Stanowisko: jednostka topograficzna (dolina, grzbiet) 5–30 ha; jeden transekt 200 m (karta: 10×200 m), zwykle wzdłuż
szlaku; ostrzeżenie, gdy długość ≠ 200 m. Zdjęcia: 3 × 100 m² co 100 m (początek, środek, koniec), Braun-Blanquet,
warstwy A–D. Termin: lipiec–sierpień (ostrzeżenie poza oknem). Powtarzanie co 6 lat (przy ocenie wpływu nartostrad – co 2).

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ „brak danych” → XX) + powierzchnia + opis | z selecta |
| Udział procentowy siedliska na transekcie | % + opis | >70 FV, 40–70 U1, <40 U2 |
| **Gatunki typowe** | lista z pokryciem + ocena ekspercka + opis | brak kosodrzewiny U2; poza nią ≥4 typowe FV, 2–3 U1, 0–1 U2 |
| Gatunki dominujące | listy warstwy B i C z pokryciem + ocena ekspercka + opis | max w B = kosodrzewina, max w C = borówka czarna/śmiałek pogięty: oba FV, jedno U1, żadne U2 |
| Naturalny kompleks siedlisk subalpejskich | % kosodrzewiny (puste → udział na transekcie) + siedliska towarzyszące + lista zbiorowisk | półnaturalne dominują U2; powypasowe U1; tylko naturalne i kosodrzewina >50% FV, ≤50% U1; brak strefy subalpejskiej XX |
| **Zniszczenia mechaniczne** | % + przyczyna + opis | ≤5 FV, ≤30 U1, >30 U2 |
| Obumieranie igieł kosodrzewiny | % (liczba, „do 10”, zakres) albo klasa z karty + opis | ≤10 FV, ≤30 U1, >30 U2 (procent ma pierwszeństwo) |
| **Bogactwo porostów epifitycznych** | lista z pokryciem + „nie stwierdzono” + liczba wprost + opis | ≥4 z 5 gatunków FV, 2–3 U1, 0–1 U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Granice**: udział 70% i 40% → U1 (sprawozdanie 2021: Sokolica 40% → U1); zniszczenia 5% → FV („nie większe niż 5%”),
  30% → U1; obumieranie 10% → FV („do 10%”), 30% → U1; kompleks: kosodrzewina dokładnie 50% → U1 (FV wymaga >50%).
- **Gatunki typowe – luka tab. 2**: FV = kosodrzewina + 4 inne, U1 = + co najmniej 2, U2 = „brak poza kosodrzewiną”.
  Kosodrzewina + 1 gatunek nie spełnia U1 → U2. Brak kosodrzewiny → U2 (2021, Polica: brak siedliska).
- **Gatunki typowe – lista**: liczy się 9 gatunków z tab. 1 (kosodrzewina, jarząb górski, jałowiec halny, porzeczka skalna,
  borówka czarna i brusznica, podbiałek, śmiałek pogięty, wietlica alpejska). Szersza lista z pkt 4 przewodnika (wierzba
  śląska, róża alpejska, urdzik…) jest w katalogu, ale do liczby się nie wlicza – formularz ostrzega. Sorbus aucuparia
  bez podgatunku liczony jak S. aucuparia subsp. glabrata (sprawozdanie 2021 używa obu zapisów). Synonimy raz.
- **Gatunki typowe – korekta ekspercka**: 2021 Sokolica dostała U1 mimo kompletu gatunków (gatunki zrębowe, świerk nad
  kosówką). Pole „Ocena ekspercka” ma pierwszeństwo; formularz ostrzega przy malinie/wierzbówce.
- **Gatunki dominujące**: liczy się gatunek z największym pokryciem w warstwie (remis – wszystkie z remisu). Bez pokryć
  brak podpowiedzi. Ostrzeżenie przy gatunkach <10% (metodyka: tylko ≥10%).
- **Kompleks**: tab. 2 łączy w U1 „kosodrzewina <50%” i „spory udział siedlisk powypasowych” – formularz traktuje każde
  z osobna jako U1. Karta przykładowa nie podaje udziału kosodrzewiny w kompleksie – stąd fallback do udziału siedliska na
  transekcie. XX dla stanowisk poniżej strefy subalpejskiej (2021, Polica 2); XX w niekardynalnym wskaźniku nie blokuje oceny.
- **Porosty – luka tab. 2**: U1 wymaga dwóch gatunków „o pokryciu >5%”; 2–3 gatunki o niższym pokryciu tab. 2 nie
  klasyfikuje. Sprawozdanie 2021 dało im U1 (Izera, Sokolica) – formularz też, z ostrzeżeniem.
- **Udział powierzchni FV/U1/U2** (karta: przy ocenie ogólnej) – trzy liczby w „Innych informacjach”, jak w 2330/3240.
- **Kody oddziaływań**: słownik 2011 (jak 2013–2014): D01.01, G01.04.01, G01.06, G02.02, G05.01, H05.01, K02 i in.
- **Nazwa obszaru** (pasmo/masyw) – dodatkowe pole Stanowiska, bo karta je ma.

## Przykład – Sokolica (Babia Góra), 26.08.2007
Wynik **jak w oryginale**: wszystkie wskaźniki FV, powierzchnia FV, struktura FV, perspektywy FV, ocena ogólna FV;
udział FV 100%, U1 0%, U2 0%. Koordynator zanonimizowany („Jan Kowalski”). Podpowiedzi formularza zgadzają się z każdą
oceną eksperta (test).

Przeniesienia: współrzędne ucięte w przewodniku – do minut; wysokości warstw C i D z metrów na cm (1 m → 100, 0,5 → 50,
0,05 → 5, 0,03 → 3); „Politrichum commune” → Polytrichum commune; trend powierzchni nie podany → „nie podlega zmianom”;
powierzchnia płatów przepisana dosłownie („Suma powierzchni wydzieleń 25d, 25g, 19–23,51 ha” – nie wiadomo, czy to
23,51 ha, czy wydzielenia 19–23 i 51 ha). Gatunki typowe: wierzba śląska z karty nie jest w tab. 1 – i tak 6 innych → FV.
Kompleks: towarzyszące zbiorowiska 40% + 20%, kosodrzewina z udziału na transekcie 80% → FV. Drobna niespójność samej
karty: jarząb ma 40% w „gatunkach typowych”, a 30% w „dominujących” – przepisane jak jest. Oddziaływania: 501 Szlaki
piesze → D01.01, 624 Turystyka górska → G01.04.01; intensywność B → M, wpływ „–”, stary kod w opisie. „Zagrożenia”
(tekst) → G05.01, D01.01, H05.01. Rok, typ monitoringu, „monitoring wymagany – tak, stanowisko badawcze, co 5 lat” – w uwagach.
