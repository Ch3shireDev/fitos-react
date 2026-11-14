# Specyfikacja karty 3220 – Pionierska roślinność na kamieńcach górskich potoków

Formularz karty obserwacji wg przewodnika GIOŚ (Perzanowska 2012, cz. II, s. 170–180, tab. 1 i 2, przykładowa karta
Siwa Woda) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021. Siedlisko nieleśne,
niepriorytetowe, Karpaty (region alpejski i pogórze w kontynentalnym). Silnik wspólny (`src/7120`) – **bez zmian**.
Z `src/forest` tylko generyczne klocki (`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`, `gradeMap`).
Karta rejestruje się sama przez `meta.ts`.

Stanowisko: odcinek łożyska 0,5–1 km, na nim jeden transekt 200×10 m (ostrzeżenie, gdy nie 2000 m²). Zdjęcia: 3
(początek, środek, koniec transektu; w karcie z przewodnika po 25 m²), warstwy B, C, D. Termin: czerwiec–sierpień
(ostrzeżenie poza tym oknem). Powtarzanie co 6 lat. Dodatkowe pola stanowiska: rzeka/potok, zarządzający terenem
(jest w karcie z przewodnika), badany odcinek łożyska, **większe wezbrania od poprzedniego badania** (metodyka każe je
notować).

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Parametr | Dane | Podpowiedź |
|---|---|---|---|
| Powierzchnia kamieńców na transekcie | powierzchnia | % transektu + zmiana (select) + ha + opis | >25 FV, 10–25 U1, <10 U2; zmiana: stabilna FV, inne U1, wyraźny spadek U2; gorsza z dwóch |
| Szerokość kamieńców | struktura | a + b (m) + łożysko (info) + opis | ≥7 FV, 2–7 U1, <2 U2 |
| Pokrycie kamieńców przez roślinność zielną | struktura | % + opis | <30 FV, 30–60 U1, >60 U2 |
| Wysokość warstwy zielnej | struktura | 20 pomiarów lub średnia (cm) + max + opis | <30 FV, 30–50 U1, >50 U2 |
| **Gatunki ekspansywnych roślin zielnych** | struktura | select + lista z pokryciem + opis | z selecta |
| **Obce gatunki inwazyjne** | struktura | select (opcjonalny) + lista + opis | select; bez niego z listy: 0 FV, ≥1 U1 |
| Gatunki krzewów | struktura | select (opcjonalny) + lista + „brak krzewów” + opis | select; bez niego najgorszy gatunek z listy |
| **Zwarcie krzewów na transekcie** | struktura | select + % (info, co 5%) + opis | z selecta |
| Udział gatunków drzewiastych (>1,5 m) | struktura | select + lista + łącznie % + opis | z selecta |
| **Obecność kompleksu siedlisk 3220, 3230, 3240, 91E0** | struktura | 4 × (brak / szczątkowo / dobrze) + opis | ≥3 dobrze FV; 0–1 obecny U2; reszta U1 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Powierzchnia kamieńców – przy parametrze „Powierzchnia”**: tab. 1 ma „Powierzchnię zajętą przez siedlisko na
  transekcie” w strukturze, tab. 2 – jako wiersz nad nagłówkiem struktury, czyli parametr powierzchni (progi w arach
  i % transektu). Karta 2010 ma oba: „Powierzchnia siedliska 0,25 ha/500 m” (FV) i „Powierzchnia kamieńców 50%” w
  strukturze. Sprawozdanie 2015–2018: wskaźnik „Procent powierzchni zajęty przez siedlisko na transekcie” **wyłączony
  z oceny od 2016**; 2021 – 9 wskaźników struktury, 4 kardynalne. Formularz idzie za tab. 2 i 2016+: jeden wskaźnik
  przy parametrze powierzchni, struktura ma 9 wskaźników.
- **Powierzchnia – procent i zmiana**: tab. 2 łączy w FV „nie podlega zmianom lub zwiększa się” z „na ogół >5 a
  (>25%)”. Gdy są obie informacje, liczy się gorsza. Same „brak danych do porównania” bez procentu → XX. Granice 10% i
  25% (2 i 5 arów) – U1.
- **Szerokość – granica 7 m**: tab. 2 ma „>7–8 m” (FV) i „2–7 m” (U1). Karta Siwa Woda: „1–2 m + 5–6 m” → FV, czyli
  ok. 7 m to FV – formularz liczy ≥7 m do FV. Zakresy z karty wpisywane środkiem przedziału (1,5 + 5,5).
  Sprawozdanie 2021 pisze „poniżej 0,2 m – U2” – oczywista literówka (tab. 2: <2 m), nie przenoszę.
- **Wysokość – granica 25–30 cm**: rozmyta granica rozstrzygnięta na korzyść FV (<30 cm FV), 30 i 50 cm – U1.
  Metodyka każe liczyć średnią z 20 pomiarów – pole na pomiary liczy średnią i ostrzega, gdy pomiarów nie jest 20.
  Średnia wpisana wprost ma pierwszeństwo.
- **Pokrycie – granice**: 30% i 60% – U1. Kamieniec zupełnie bez roślin (część ekspertów w 2010 dawała U2) – wg tab.
  2 to FV; pomoc każe opisać to w uwagach.
- **Ekspansywne**: tab. 2 opisuje formę występowania, bez progów %. Ocena z selecta, lista gatunków do karty;
  ostrzeżenie, gdy wybrano „brak lub pojedyncze”, a pokrycie z listy >5% (tylko sygnał, nie próg). Trzcinnik szuwarowy
  i lepiężnik wyłysiały to gatunki typowe, liczone jako ekspansywne dopiero w łanach (sprawozdania 2011, 2021).
- **Obce – kilka gatunków pojedynczo**: tab. 2 ma U1 „pojedyncze lub w niewielkich kępach, jeden gatunek” i U2
  „łanowe jednego lub kilku” – kilku rozproszonych nie opisuje. Sprawozdanie 2021 ocenia po formie występowania
  (pojedyncze U1, łanowe U2) → formularz daje U1 i ostrzega. Liczą się tylko inwazyjne; archeofity i efemerofity z
  tab. 4 sprawozdania 2021 (fiołek polny, miotła zbożowa, tasznik, pomidor…) są w katalogu jako obce nieinwazyjne i się
  nie liczą. Synonimy (Fallopia/Reynoutria japonica, Conyza/Erigeron canadensis, Epilobium adenocaulon/ciliatum) – raz.
- **Gatunki krzewów – wierzba purpurowa**: tab. 2: FV „wierzby Salici-Myricarietum; olsza szara”, U1 „gatunki
  Salici purpureae, łęgów, grądów…”. Sprawozdanie 2021 ocenia S. purpurea i S. fragilis na U1. Katalog: FV – września,
  wierzba siwa, wierzba wawrzynkowa, olsza szara; U1 – wierzba purpurowa, krucha, biała, trójpręcikowa, wiciowa, iwa,
  olsza czarna, świerk, jawor i inne; U2 – robinia, klon jesionolistny, topole kanadyjska i balsamiczna. Z listy liczy się
  najgorszy gatunek. **Karta z przewodnika dała FV mimo wierzby purpurowej** – dlatego select ma pierwszeństwo, a
  formularz pokazuje rozjazd z listą. Brak krzewów (np. po wezbraniu) → FV.
- **Zwarcie krzewów i drzewa >1,5 m**: tab. 2 bez progów liczbowych – ocena z selecta, procent tylko do karty
  (ostrzeżenie, gdy zwarcie nie jest wielokrotnością 5%, jak każe tab. 1).
- **Kompleks siedlisk**: FV, gdy ≥3 typy dobrze wykształcone; U2, gdy obecny najwyżej 1 typ; reszta U1, także luka
  tab. 2 „dwa typy, żaden dobrze wykształcony”. Siedlisko szczątkowe liczy się jako obecne. Podpowiedź dopiero, gdy
  wypełnione są wszystkie cztery pola. Sprawozdanie 2011 oceniało górne odcinki (Siwa Woda, Waksmundzki Potok) na FV
  mimo niepełnego kompleksu („warunki fizjograficzne nie pozwalają”) – pomoc mówi, że wtedy ocenę wybiera się ręcznie.
- **Ocena struktury**: jak w innych kartach (silnik) – FV, gdy kardynalne FV i żaden pozostały nie U2; kardynalny U2
  → U2. Sprawozdanie 2015–2018 zaznacza, że oceniano „bez zasady najgorszy decyduje” (dla 3220 nie dodano erraty) –
  formularz stosuje regułę z tab. 2, jak pozostałe karty.
- **Udział powierzchni FV/U1/U2**: karta przy ocenie ogólnej podaje udział siedliska w różnym stanie (Siwa Woda: 100/0/0).
  Silnik nie ma takiego pola, więc – jak w 2330 – trzy liczby w „Innych informacjach”.
- **Kody oddziaływań**: słownik 2011 (jak w sprawozdaniach 2015–2018 i 2021). Karta z przewodnika ma stare kody 2010.

## Przykład – Siwa Woda, 10.07.2010 (rozbieżność z oryginałem)
Ekspert zanonimizowany („Jan Kowalski”). Współrzędne ucięte w przewodniku – do minut. Wskaźniki jak w karcie: powierzchnia
FV (50% transektu, 0,25 ha), szerokość FV (1,5 + 5,5 = 7 m), pokrycie FV (7,5%), wysokość FV (12,5 cm, max 60),
ekspansywne FV, obce FV, gatunki krzewów FV (wybrane ręcznie; formularz ostrzega, że wg listy U1 przez wierzbę
purpurową), zwarcie krzewów FV (<15%), drzewa FV (<1%), **kompleks U1** (3220 i 3240 dobrze, 91E0 szczątkowo), perspektywy FV.

**Rozbieżność:** oryginał podaje strukturę FV i ocenę ogólną FV (tak samo sprawozdanie 2011, tab. ocen stanowisk). Kompleks
siedlisk jest wskaźnikiem kardynalnym, a tab. 2 wymaga dla FV wszystkich kardynalnych na FV – więc formularz (silnik,
bez zmian) daje **strukturę U1 i ocenę ogólną U1**. Wewnętrzna niespójność karty z przewodnika (sprawozdanie 2011 tłumaczy
FV kompleksu na Siwej Wodzie fizjografią, karta wpisuje U1). Przykład zostawia U1 jak w karcie, a rozbieżność opisuje w
uwagach; test pilnuje tego wyniku wprost. Kto chce FV/FV – zmienia ocenę kompleksu na FV ręcznie.

Pozostałe przeniesienia: kody 690 → G01 (wpływ 0, B → M), 941 → L08 (wpływ +, A → H), stary kod w opisie. „Zagrożenia” z
raportu rocznego → K02 z opisem. Typ stanowiska (referencyjne), typ monitoringu, uzasadnienie i data kontroli – w uwagach.
Zbiorowiska „?” – jak w oryginale. Zdjęcia I–III: 34, 34 i 30 gatunków, wszystkie w warstwie C, zakres wysokości wpisany
środkiem (10–15 → 12,5 cm).
