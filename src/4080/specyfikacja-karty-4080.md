# Specyfikacja karty 4080 – Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej

Formularz karty obserwacji wg przewodnika GIOŚ (Świerkosz 2012, cz. II, s. 257–267, tab. 1 i 2, lista kardynalnych,
przykładowa karta Kocioł Wielkiego Stawu) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.
Siedlisko zaroślowe, niepriorytetowe, region alpejski (Tatry, Babia Góra, Pilsko, Bieszczady) i kontynentalny (Karkonosze).
Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian** (z `src/forest` tylko generyczne klocki: `speciesInput`,
`pickField`, `labelOf`, `gradeMap`, `plNum`, `normalizeName`). Własna reguła struktury niepotrzebna – ogólna
(`aggregateStructure`) zgadza się z tab. 2. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: grupa płatów w odległości do 100 m, w zbliżonych warunkach. **Bez stałego transektu** (przewodnik: na
transektach „praktycznie niemożliwe”) – pole „Wymiary transektu” opisowe, bez wartości domyślnej. Współrzędne: pole
wielowierszowe (płat albo punkt na linię – karta podaje dwa punkty). Wysokość n.p.m. jako tekst/zakres („1320–1480”),
ostrzeżenie poza 1000–2000 m. Zdjęcia: domyślnie 3 × 25 m² (można 20 lub 12 m²), warstwy B, C, D, pole „Uwagi do zdjęcia”
(np. „nie wykonano – brak dostępu”). Termin: 20.06–31.07 bez ostrzeżenia; sierpień–wrzesień łagodne ostrzeżenie (tak
badano w 2016); reszta – ostrzeżenie.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska na stanowisku (parametr) | select trendu (+ „brak danych” → XX) + powierzchnia tekstem + opis | z selecta |
| **Występowanie w warstwie krzewów wierzby lapońskiej lub wierzby śląskiej** | lista krzewów z pokryciem + ocena ekspercka + opis | suma S. lapponum + S. silesiaca + S. helvetica: ≥30 FV, 10–<30 U1, <10 U2; brak typowych wierzb na liście → U2 |
| **Naturalne odnowienie wierzby lapońskiej lub śląskiej** | % w runie (liczba, „<1”, zakres) + klasa + opis | ≥0,5 FV, >0 U1 (sporadycznie), 0 U2 |
| **Charakterystyczna kombinacja gatunków** | % gatunków ziołoroślowych/typowych w warstwie zielnej + ocena ekspercka + opis | ≥50 FV, 10–<50 U1, <10 U2 |
| Gatunki dominujące, w tym ekspansja borówki czarnej i śmiałka pogiętego | gatunek + pokrycie (liczba/zakres) + ocena ekspercka + opis | <50 FV, 50–70 U1, >70 U2 (środek zakresu) |
| Ekspansja kosodrzewiny | % w płacie (liczba/zakres) + opis | ≤30 FV, >30–50 U1, >50 U2; gdy pusto – wskazówka z listy krzewów |
| **Zniszczenia mechaniczne** | select + opis | z selecta |

Ocena ekspercka (select „—” domyślnie) ma pierwszeństwo przed liczbą wszędzie, gdzie jest.

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Zestaw wskaźników.** Tab. 2 i lista kardynalnych: 6 wskaźników struktury, 4 kardynalne (z „charakterystyczną
  kombinacją”). Karta przykładowa z tego samego przewodnika ma 5 wierszy – bez kombinacji – i tak samo oceniano w 2016
  i 2021 r. (sprawozdania: 5 wskaźników, 3 kardynalne). Pole „Zestaw wskaźników struktury” w Stanowisku: „Przewodnik
  (tab. 2)” (domyślnie) albo „Karta przykładowa i monitoring 2016–2021”. W drugim kombinacja zostaje w karcie, ale silnik
  ją pomija (`excluded` – istniejący mechanizm z 91E0, jak w 3240).
- **Granice wierzb: 30% → FV.** Tab. 2 pisze „>30%” FV i „10–30%” U1, ale tab. 1 „co najmniej 30%”, a karta ocenia
  „Salix lapponum – 30%” na FV. Formularz idzie za tab. 1 i kartą. 10% → U1.
- **Granica odnowienia: 0,5% → FV.** Tab. 2 „powyżej 0,5%”, ale tab. 1 podaje typowe odnowienie „0,5 do 5%”, a karta
  ocenia „S. silesiaca 0,5%” na FV. „Sporadycznie” (U1) = obecne, ale <0,5%.
- **Wierzby typowe**: lapońska, śląska, szwajcarska. Olsza zielona (Bieszczady), jarząb, kosodrzewina są wpisywane, ale
  nie liczą się. Przy <10% ostrzeżenie z przypisu do tab. 2 (może to 6430/4060/4070 z pojedynczymi wierzbami).
- **Kombinacja liczbowo.** Tab. 2 FV „zgodna z opisem podtypów”, U1 „<50%”, U2 „<10%” – formularz przyjmuje ≥50% jako FV.
  Sprawozdanie 2016–2018 uznało waloryzację za nieścisłą i proponowało liczyć gatunki Adenostylion/Calamagrostietalia
  (FV liczne, U1 <5, U2 1–2) – opisane w pomocy, nie wdrożone (to tylko propozycja).
- **Dominanty – zakres.** Karta podaje „20–50%”: podpowiedź z środka zakresu (35% → FV, jak w karcie). Gdy zakres
  przechodzi przez próg, wyjaśnienie to mówi i każe rozstrzygnąć ekspercko. Granice 50 i 70 → U1. Naturalna dominacja
  (karta: trzęślica „zjawisko naturalne”) – przez ocenę ekspercką.
- **Kosodrzewina.** Tab. 2: FV „nie większy niż 30%”, U1 „30–50%” – 30 → FV, 50 → U1.
- **Ocena struktury**: reguła ogólna – U2 przy kardynalnym U2, FV gdy kardynalne FV i żaden pozostały nie U2, inaczej U1.
  Sprawozdanie 2021 (Tarnica: odnowienie U1 → struktura U1) zgodne.
- **Perspektywy U1**: w tab. 2 opisowe („zauważalne są tendencje…”) – przepisane, bez „inne kombinacje”.
- **Raport roczny z karty** (monitoring wymagany, uzasadnienie, propozycje) – pola w „Innych informacjach”; rok, typ
  monitoringu i koordynator – w uwagach. Udział powierzchni FV/U1/U2 (karta: przy ocenie ogólnej) – trzy liczby, jak w 2330/3240.
- **Kody oddziaływań**: słownik 2011 (jak w sprawozdaniach 2016–2018): turystyka (G01.02, G01.04, G05.01), narciarstwo
  (G01.06, G02.02), zgryzanie (K04.05), lawina (L04), erozja, sukcesja, azot, klimat, X.

## Przykład – Kocioł Wielkiego Stawu (Karkonosze), 8.07.2010
Koordynatorzy zanonimizowani („Jan Kowalski”, „Anna Nowak”). Zestaw: „karta przykładowa i monitoring 2016–2021”.
Oceny jak w karcie: powierzchnia FV, wierzby FV (S. lapponum 30%), odnowienie FV (0,5%), dominanty FV (trzęślica 20–50%),
kosodrzewina FV (brak), zniszczenia FV, perspektywy FV. **Struktura FV, ocena ogólna FV – jak w oryginale**, podpowiedzi
formularza zgodne z ekspertem dla każdego wskaźnika. Udział FV 100%.

Rozbieżności (formalne, bez wpływu na wynik):
- karta nie ma wiersza „Charakterystyczna kombinacja gatunków” – w przykładzie XX „nie oceniano”, pomijany. W zestawie
  z przewodnika ten sam przykład dałby strukturę i ocenę ogólną **XX** (kardynalny bez oceny) – stąd zestaw karty;
- obie granice (30% wierzb, 0,5% odnowienia) wychodzą FV tylko dzięki interpretacji powyżej; litera tab. 2 („>30%”,
  „powyżej 0,5%”) dałaby U1 i U1, a więc strukturę i ocenę ogólną U1;
- nazwy wierszy jak w tab. 2 („Gatunki charakterystyczne” w karcie = występowanie wierzb; „śmiałka darniowego” w karcie,
  „pogiętego” w tab. 2);
- „Obszary chronione” i „Nazwa obszaru” (PLH020006) w jednym polu; zdjęcie III puste z uwagą „nie wykonano”;
  „Nie stwierdzono oddziaływań” – brak oddziaływań i zagrożeń, zdanie w komentarzu do oceny ogólnej.
