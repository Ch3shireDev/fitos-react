# Specyfikacja karty 6440 – Łąki selernicowe (Cnidion dubii)

Formularz karty obserwacji wg przewodnika GIOŚ (Załuski 2012, cz. III, s. 64–78, tab. 1 i 2, lista wskaźników
kardynalnych, przykładowa karta „Brańszczyk 2”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (75 stanowisk)
i 2015–2018 (badania 2016, 71 stanowisk). Sprawozdania 2023–2025 dla 6440 w repo nie ma. Siedlisko niepriorytetowe,
tylko region kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna regułą
ogólną (bez `structureRule`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: nazwa, typ, nazwa obszaru, zbiorowiska, opis, powierzchnia płatów, formy ochrony, zarządzający, współrzędne
początku, środka i końca, transekt (domyślnie 200x10 m; przewodnik dopuszcza krótszy i szerszy, łamany albo łukowaty –
zawsze 2000 m²), wysokość, data, wykonawca, dodatkowi eksperci. Zdjęcia: 3 × 25 m² (5×5 m), warstwy B–D, uwagi.
Termin: bez ostrzeżenia 20.06–31.08; 15–19.06 oraz wrzesień – 15.10 ostrzeżenie miękkie („nawet we wrześniu”, praktyka
sierpień–wrzesień, pojedynczo październik); poza – twarde. Inne informacje: propozycje działań, „Monitoring jest
wymagany” + uzasadnienie, udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | z selecta |
| Procent powierzchni zajęty przez siedlisko na transekcie | liczba % | >40 FV, 20–40 U1, <20 U2 |
| Struktura przestrzenna płatów siedliska | select | naturalna/nieznaczna FV, średnia U1, silna antropogeniczna U2 |
| **Gatunki charakterystyczne** | lista z pokryciem + liczba wprost + ocena | ≥2 FV; jeden ≥25% U1; jeden <25% albo brak U2 |
| Gatunki dominujące | lista z pokryciem + ocena | charakterystyczny/wyróżniający wśród dominantów FV; bez nich gatunki innych siedlisk U2; same łąkowe U1 |
| Cenne składniki flory | lista z pokryciem + „nie stwierdzono” + ocena | ≥3 gat. albo 1–2 łącznie >25% FV; 1–2 mniej U1; brak U2 |
| **Obce gatunki inwazyjne** | lista + łączne pokrycie + „nie stwierdzono” | brak FV, ≤5% U1, >5% U2 |
| **Gatunki ekspansywne roślin zielnych** | lista + łączne pokrycie + „nie stwierdzono” + ocena | <10% FV, 10–30% U1, >30% U2 (z wyjątkiem niżej) |
| **Ekspansja krzewów i podrostu drzew** | lista + łączne pokrycie + warstwa (c/b) + „nie stwierdzono” | ≤0,5% w runi FV, ≤1% albo warstwa b U1, >1% U2 |
| Zachowanie płatów lokalnie typowych | liczba % | >40 FV, 10–40 U1, <10 U2 |
| Wojłok (martwa materia organiczna) | min/maks./średnia cm | <0,5 FV, 0,5–2 U1, >2 U2 |

## Rozjazdy metodyki (krótko)
- **„Stan pośredni”** (U1 w czterech wskaźnikach) – tab. 2 nie podaje progów liczbowych dla U1, formularz bierze
  przedział między FV a U2. Granice liczbowe (20 i 40%, 10 i 40%, 0,5 i 2 cm) liczone do U1.
- **Gatunki charakterystyczne**: FV w tab. 2 to „dwa lub więcej, *zwykle* jeden rośnie licznie (>25%)”. Karta przykładowa
  dała FV przy czterech gatunkach po ≤5% – formularz nie wymaga licznego gatunku, ale to pisze. Sprawozdanie 2016–2018
  wskazuje tę lukę i proponuje wymagać dominanta wśród gatunków charakterystycznych lub wyróżniających – pomoc to opisuje,
  ocenę wg propozycji wybiera się w polu. Wyróżniających (fiołek mokradłowy, turzyca wczesna, wiechlina wąskolistna,
  groszek błotny, gęsiówka Gerarda) formularz nie liczy do progu – tab. 2 mówi o charakterystycznych. Czarcikęsik Kluka
  i fiołek nibypsi (wg Brzega i Wojterskiej) są w tab. 1 – liczą się.
- **Gatunki dominujące**: sprawozdanie 2016–2018 zauważa, że wg tab. 2 do FV wystarcza jeden gatunek wyróżniający wśród
  dominantów – formularz idzie za tab. 2, propozycję zmiany opisuje pomoc. Trawy łąkowe (wyczyniec, kostrzewa czerwona,
  śmiałek) traktuje jako gatunki łąkowe, nie „innych siedlisk”.
- **Cenne składniki flory**: co jest cenne, decyduje ekspert (formularz liczy każdy wpisany gatunek i ostrzega przy
  obcych i ekspansywnych). „Kilka” = 3 i więcej. Spadek FV z 67 do 42 w 2016 r. sprawozdanie przypisuje zmianie
  rozporządzenia o ochronie gatunkowej roślin (2014).
- **Obce**: tab. 2 „udział nieznaczny” – formularz: do 5% włącznie. Sprawozdanie 2016–2018 uważa wskaźnik za „zbyt
  czuły” i proponuje FV dla pojedynczych osobników – formularz idzie za tab. 2. Archeofity z tab. 10 sprawozdania
  (włośnice, rdestówka powojowata, groszek bulwiasty, chwastnica) – liczone, z ostrzeżeniem (chwastnica jest przykładem
  w tab. 1).
- **Ekspansywne**: tab. 2 U2 wymaga >30% *i* przewagi gatunków szuwarowych, ziołoroślowych, zrębowych lub ruderalnych.
  Gdy suma >30%, ale co najmniej połowę daje trawa łąkowa – formularz daje U1. W 2016 r. U2 na 35 z 71 stanowisk;
  sprawozdanie proponuje nie liczyć traw łąkowych w ogóle – opisane w pomocy, ocena w polu.
- **Krzewy**: tab. 2 FV „brak albo pojedyncze wystąpienia w runi”, U2 „wyraźny udział (>1%)”. Formularz: pojedyncze =
  do 0,5%; krzewy w warstwie b przy ≤1% – U1. Sprawozdanie 2016–2018: nie uwzględniać rowów i miedz.
- **Procent powierzchni**: w tab. 2 „na stanowisku”, w tab. 1 i sprawozdaniu 2016–2018 – „na transekcie”. Formularz
  używa nazwy ze sprawozdania.
- **Ocena ogólna w tab. 2**: „wszystkie FV lub dwa FV i jeden U1 → FV; dwa lub trzy U1, brak U2 → U1”. Sprawozdanie
  2009–2011 tego nie stosuje (Brody 1: FV/U1/FV → U1; Grądy 1, Przyborów 1 i 2: FV/FV/U1 → U1) – formularz liczy regułą
  ogólną silnika, bez zmian.

## Przykład – Brańszczyk 2 (dolina Bugu, Ostoja Nadbużańska), 14.08.2010
Eksperci zanonimizowani („Jan Kowalski”, „Anna Nowak”). **Wszystkie oceny wskaźników jak w karcie**, podpowiedzi
formularza przy każdym wskaźniku zgodne z ekspertem, bez ostrzeżeń: powierzchnia FV, 30% na transekcie U1, mała
fragmentacja FV, 4 gatunki charakterystyczne + 3 wyróżniające FV, selernica wśród dominantów FV, 9 gatunków cennych FV,
szczaw omszony i uczep po <5% U1, ekspansywne 18% (wyczyniec 15%) U1, krzewy w runi U1, płaty typowe 50% FV, wojłok
śr. 0,2 cm FV, perspektywy FV.

**Rozjazd: struktura i ocena ogólna.** Karta ma strukturę FV i ocenę ogólną FV, choć trzy wskaźniki kardynalne (obce,
ekspansywne, krzewy) mają U1. Formularz liczy regułą ogólną (kardynalny U1 → struktura U1) – struktura U1, ocena ogólna
U1. Ocena FV nie wynika też z reguły „dwa FV i jeden U1” z tab. 2, bo ta dotyczy parametrów, a nie wskaźników struktury.
Sprawozdanie 2009–2011 ma dla Brańszczyka 2 FV/FV/FV/FV, w 2016 r. – U2/U2/FV/U2.

Inne przeniesienia: współrzędne ucięte – do minut; „<5%” → 1%; krzewy (trzy gatunki „<5%” w warstwie c bez sumy) –
łącznie 1%; szczaw omszony zostaje na liście ekspansywnych jak w karcie (formularz go pomija, liczy się w obcych);
„Phleum pretense”, „Trifolium pretense” → pratense; stare kody 102/140/930/950/954 → A03/A04/K01.04/K02/I01,
intensywność B → M, C → L; tekst „Zagrożenia” → A04.01, A03.03, K02.01; perspektywy w karcie bez opisu – opis
z uzasadnienia; rok i typ monitoringu w uwagach.
