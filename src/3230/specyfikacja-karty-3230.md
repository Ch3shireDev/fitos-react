# Specyfikacja karty 3230 – Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków

Formularz karty obserwacji wg przewodnika GIOŚ (Perzanowska 2012, cz. II, s. 180–192, tab. 1 i 2, przykładowa karta
Białka 03) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021. Siedlisko nieleśne,
niepriorytetowe, tylko region alpejski (Karpaty). Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` tylko
generyczne klocki (`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: odcinek koryta ok. 0,5–1 km z kamieńcami (pole „Rzeka / potok i odcinek”); jeden transekt 200×10 m przez
najważniejsze skupienia zarośli (ostrzeżenie, gdy nie 2000 m²). Zdjęcia: 3 (początek, środek, koniec transektu), domyślnie
25 m² (metodyka nie podaje wielkości), warstwy B i C. Termin: czerwiec–sierpień (ostrzeżenie poza oknem). Badania co 6 lat;
dodatkowe pole „Większe wezbrania od poprzedniego badania” – metodyka każe odnotowywać powodzie. Wysokość n.p.m.:
ostrzeżenie poza ok. 350–1050 m (zasięg wrześni 380–1000 m).

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ XX) + ha + opis | z selecta |
| Powierzchnia zajęta przez siedlisko na transekcie | % transektu | >10 FV, 5–10 U1, <5 U2 |
| **Gatunki krzewów** | select + lista krzewów z pokryciem | z selecta; lista → ostrzeżenia |
| Wysokość krzewów wrześni (średnia) | m | ≥0,7 FV, ≥0,2 U1, <0,2 U2 |
| Zwarcie krzewów wrześni w płacie | % | 30–80 FV; 10–30 / 80–95 U1; <10 / >95 U2 |
| Struktura przestrzenna płatów zarośli | select | z selecta |
| **Udział gatunków drzewiastych (>1,5 m)** | select (opcjonalny) + zwarcie % + lista | z selecta, inaczej 0 FV, ≤30 U1, >30 U2 |
| **Gatunki ekspansywnych roślin zielnych** | select + lista z pokryciem | z selecta |
| **Odnowienie krzewów wrześni** | select | z selecta |
| Szerokość kamieńców | a + b (m) albo łącznie wprost | >30 FV, 10–30 U1, <10 U2 |
| Obce gatunki inwazyjne | lista + sposób występowania + liczba wprost + „nie stwierdzono” | 0 FV; pojedynczo/kępy U1; masowo U2 |
| Kompleks siedlisk 3220, 3230, 3240, 91E0 | 4 selecty (dobrze / słabo / brak) | ≥3 dobrze FV; ≥2 obecne i ≥1 dobrze U1; reszta U2 |

Kolejność i zestaw jak w tab. 1 i w sprawozdaniu 2021 (11 wskaźników struktury). Wskaźniki z 2009 r. („Obecność budowli
hydrotechnicznych”, „Odległość od ściany lasu”, „Pozyskiwanie żwiru z koryta”) wycofano w 2016 – ich nie ma.

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Wiersz „Powierzchnia kamieńców na transekcie” w tab. 2** stoi w miejscu parametru „Powierzchnia siedliska”, ale miesza
  trend („nie podlega zmianom lub zwiększa się”) z udziałem w transekcie („>2 a, >10%”). Formularz rozdziela: parametr
  ocenia trend (select), a liczby (>10% FV, 5–10% U1, <5% U2) idą do wskaźnika „Powierzchnia zajęta przez siedlisko na
  transekcie”, który w tab. 2 nie ma własnego wiersza. Granice 10% i 5% → U1.
- **„Wierzba szara” w tab. 2** czytana jako wierzba siwa *Salix eleagnos* (rozdz. 4, karta, sprawozdania). „Pełny zestaw”
  nie wymaga wszystkich gatunków naraz – ocena z selecta; lista daje ostrzeżenia (brak wierzby siwej, brak wrześni, przewaga
  innych krzewów).
- **Wysokość**: 0,7 m → FV, 0,2 m → U1; powyżej 2,5 m też FV, z ostrzeżeniem.
- **Zwarcie**: 30% i 80% → FV, 10% i 95% → U1.
- **Drzewa**: „zwarcie <30%” vs „>30%” – 30% → U1. Procent nie odróżni „pojedynczych osobników” (FV) od „wyraźnego udziału”
  (U1), więc select ma pierwszeństwo, a przy samym procencie 0% → FV, każde >0 → U1. Ostrzeżenie przy rozjeździe.
- **Gatunki ekspansywne**: tab. 2 nie ma progów procentowych – ocena z selecta. W pomocy orientacyjnie: karta 15% → U1,
  sprawozdanie 2021 lepiężnik 20% → U2. Lista gatunków ekspansywnych z opisów sprawozdań 2009 i 2021 (sadziec, wrotycz,
  lepiężnik różowy, mozga, trzcinnik piaskowy, pokrzywa, przytulia czepna, bylica).
- **Szerokość kamieńców**: format „a+b” z karty – suma obu brzegów; łączna wprost ma pierwszeństwo. 30 m i 10 m → U1.
- **Obce gatunki**: tab. 2 („jeden gatunek” w U1, „więcej niż jeden gatunek, masowo lub duże płaty” w U2) formularz czyta
  tak jak sprawozdanie 2021: o U2 decyduje masowość, nie liczba gatunków (11 z 16 stanowisk U1 przy kilku gatunkach na
  wielu z nich). Bez wyboru sposobu występowania – „pojedynczo”, z ostrzeżeniem przy pokryciu >10%. Pomoc i podpowiedź
  mówią wprost, że literalnie wyszłoby U2. Synonimy (Conyza/Erigeron canadensis, Reynoutria/Fallopia japonica) liczone raz.
- **Kompleks siedlisk**: 3230 też się liczy (jest w nazwie wskaźnika). FV: co najmniej trzy dobrze wykształcone; U1: co
  najmniej dwa obecne, w tym jedno dobrze; reszta U2 (także dwa obecne, oba słabo – nie spełniają warunku U1). Podpowiedź po
  wyborze wszystkich czterech.
- **Ocena struktury**: wspólny silnik, bez zmian – FV, gdy kardynalne FV i żaden pozostały nie U2 (tab. 2: „pozostałe
  przynajmniej U1”); kardynalny U2 → U2; inaczej U1.
- **Udział powierzchni FV/U1/U2**: karta ma go przy ocenie ogólnej; silnik nie ma takiego pola, więc trzy liczby są
  w „Innych informacjach” (jak w 2330).
- **Kody oddziaływań**: słownik 2011 – kody notowane w sprawozdaniach 2016–2018 i 2021. Karta z przewodnika ma stare kody 2010.

## Przykład – Białka 03 (27.09.2009)
Ekspert zanonimizowany („Jan Kowalski”). Wszystkie oceny wskaźników jak w karcie: powierzchnia FV, na transekcie 100% FV,
gatunki krzewów FV, wysokość 2,0 m FV, zwarcie 40% FV, struktura przestrzenna FV, **drzewa U1**, **ekspansywne U1**
(trzcinnik 15%), odnowienie FV, szerokość „5–30 m” FV, obce U1 (niecierpek gruczołowaty 5%), kompleks FV; perspektywy FV.

**Rozbieżność z oryginałem – struktura i ocena ogólna.** Karta podaje strukturę FV i ocenę ogólną FV (udział FV 100%).
Formularz liczy **U1 / U1**, bo dwa wskaźniki kardynalne (drzewa, ekspansywne) mają w samej karcie U1, a tab. 2 tej samej
metodyki wymaga dla FV wszystkich kardynalnych na FV. Sprawozdanie 2009 tłumaczy, skąd to się wzięło („oceny struktury
zarośli nie powinny negatywnie rzutować na ocenę parametru”), sprawozdanie 2021 stosuje już regułę kardynalnych. Wymuszenie
FV wymagałoby zmiany silnika (`aggregateStructure`) albo fałszowania ocen wskaźników – świadomie nie. Ocena z karty (FV)
i wyjaśnienie są w uzasadnieniu oceny ogólnej.

Dwie kolejne niespójności karty z tab. 2 (oceny zostawione jak w karcie, test pilnuje, że to jedyne rozjazdy podpowiedzi):
- **Drzewa „Brak” → U1**, a tab. 2 daje za brak FV. Formularz podpowiada FV i pokazuje „Ocena U1 odbiega od progów”.
- **Szerokość kamieńców „5–30 m” → FV**, a tab. 2 daje za 10–30 m U1, za <10 m U2. Liczb nie wpisano (zakres wzdłuż odcinka),
  więc podpowiedzi brak, a opis „5–30 m” trafia do karty.
- Do tego „Gatunki krzewów” FV przy samej wierzbie siwej na liście (tab. 2: „pełny zestaw”) – ocena z selecta, formularz
  ostrzega, że na liście nie ma wrześni.

Inne decyzje przy przepisaniu: współrzędne ucięte do minut, zdjęcia II–III z N 49°27′ jak w karcie; wrześnię karta wpisuje
w warstwie C – zostaje w C; wysokość warstwy C „2,0 m” → 200 cm; „Chrysantemum leucantemum” poprawione; Natura 2000
(PLH120024 Dolina Białki) w obszarach chronionych z adnotacją „Brak obszaru chronionego” z karty; kody 421 → E03.01,
830 → J02.03, 608 → G02.08, 941 → L08, intensywność A/B/C → H/M/L (stary kod w opisie); zagrożenia z pola tekstowego karty
rozpisane na J02.03, G02.08, E03.01; typ stanowiska, zarządzający (RZGW Kraków), typ monitoringu, „monitoring wymagany”
z uzasadnieniem, uwagi dodatkowe i odstępstwa (transekt 20×100 m, termin wrzesień) w „Uwagach”.
