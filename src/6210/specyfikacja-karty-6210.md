# Specyfikacja karty 6210 – Murawy kserotermiczne (Festuco-Brometea)

Formularz karty obserwacji wg przewodnika GIOŚ (Mróz, Bąba 2010, cz. I, s. 119–129, tab. 1 i 2, przykładowa karta
Radomice) z **modyfikacją metodyki GIOŚ z 27.05.2022** (nowe progi „Gatunków charakterystycznych”) i praktyką oceny ze
sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021 (badania 2021). Modyfikacja 2022 ma pierwszeństwo.
Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna regułą ogólną (bez `structureRule`) –
tab. 2 mówi dokładnie to samo. Z `src/forest` tylko klocki generyczne. Karta rejestruje się sama przez `meta.ts`.

Kod bez gwiazdki: priorytetowe są tylko płaty z istotnymi stanowiskami storczyków (od tego jest wskaźnik storczykowatych);
karta z przewodnika i sprawozdanie 2021 piszą „6210”.

Stanowisko: **Podtyp** (6210-1 naskalne, 6210-2 ostnicowe, 6210-3 kwietne; wymagany) – liczy, ile gatunków z listy podtypu
z tab. 1 jest na liście, i włącza ostrzeżenie przy braku storczyków w murawach naskalnych. Transekt 200 m (ostrzeżenie przy
innej długości), współrzędne początku, środka i końca. Zdjęcia: 3 × 25 m², warstwy B–D. Termin: maj – 15 sierpnia
(ostrzeżenie poza oknem); cykl 5–6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + ha + opis | z selecta |
| **Gatunki charakterystyczne** | lista + liczba wprost + „nie stwierdzono” | **2022: ≥6 FV, 2–5 U1, ≤1 U2**; wyjaśnienie pokazuje wynik wg progów 2010 (≥5 FV) i liczbę gatunków z listy podtypu |
| Obce gatunki inwazyjne | lista z pokryciem + liczba/łącznie wprost + „nie stwierdzono” | 0 FV; 1–2 gat. do 5% U1; >5% albo >2 gat. U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + forma występowania + najwyższa ilościowość w zdjęciach | 0 FV; 1 pojedynczo FV; 1–2 U1; >2 U2; ilościowość 5 w zdjęciu → U2 (tab. 1) |
| **Ekspansja krzewów i podrostu drzew** | % + lista | <10 FV, 10–25 U1, >25 U2 |
| Liczba gatunków storczykowatych | lista + liczba + „nie stwierdzono” + „termin nie pozwalał” | ≥3 FV, 1–2 U1, 0 U2; brak przy złym terminie → XX |
| Zachowanie strefy ekotonowej | select (+ XX) | z selecta |

Katalog gatunków (318 nazw z synonimami): gatunki charakterystyczne Festuco-Brometea (tab. 1: strukturotwórcze + listy
trzech podtypów; pkt 4; robocza lista klasy/rzędów/związków), gatunki „wyróżniające” z okrajków (lebiodka, klinopodium,
rzepik – nie liczą się, ostrzeżenie), storczykowate, ekspansywne, obce (tab. 4 sprawozdania 2021, archeofity i chwasty
oznaczone), drzewa i krzewy, towarzyszące.

## Rozjazdy metodyki (krótko)
- **Gatunki charakterystyczne – zmiana progów 2022**: FV z ≥5 na ≥6, U1 2–5. Karta Radomice (5 gatunków, FV) po nowemu
  dostaje U1 – formularz pokazuje „odbiega od progów”. Struktura i ocena ogólna się nie zmieniają (i tak U1).
  W 2013–2014 opisywano FV jako „powyżej 6” (!), a U1 jako „2 do 4” – nikt nie trzymał się jednej wersji.
- **Lista gatunków charakterystycznych jest otwarta** („pozostałe gatunki charakterystyczne dla klasy Festuco-Brometea”).
  Katalog to lista robocza; kto liczy inaczej, wpisuje liczbę wprost. Gatunki okrajkowe z pkt 4 (lebiodka, klinopodium,
  rzepik, oman szlachtawa) pominięte – w 2021 r. nazwane „wyróżniającymi”, karta Radomice też ich nie liczy, choć rosną
  w każdym zdjęciu.
- **Kłosownica pierzasta** jest jednocześnie gatunkiem charakterystycznym (karta Radomice liczy ją z 15%) i gatunkiem
  ekspansywnym „szczególnie” wymienionym w tab. 1. Liczy się w obu, przy ekspansywnych z ostrzeżeniem (sprawozdanie 2021:
  typowa dla muraw, ekspansywna dopiero przy nadmiernym pokryciu). To samo perz siny i pajęcznica gałęzista.
- **Ekspansywne – ilościowość „powyżej 4”** (tab. 1) czytana dosłownie: 5. Nie ma jej w tab. 2 – formularz bierze gorszą
  z dwóch ocen. **Praktyka 2021**: 1–2 gatunki do 5% pokrycia dawały FV (tab. 2: U1) – formularz liczy wg tab. 2 i ostrzega.
- **Storczykowate – „powyżej 3”**: tab. 2 nie mówi, co z dokładnie 3; w 2021 r. 3 gatunki = FV. Formularz: 3 → FV.
  Sprawozdanie 2021 chce, by wskaźnik nie wpływał na strukturę (murawy naskalne i na NE nie mają storczyków) –
  propozycji nie wprowadzono; formularz liczy wg tab. 2, ostrzega przy 6210-1, a XX przy złym terminie (jak w 2021 r.).
- **Obce – niekardynalne**, ale w 2021 r. oceniane ściśle (każdy obcy = co najmniej U1), w 2013–2014 do 1% = FV.
  Formularz: tab. 2; archeofity i chwasty z tab. 4 (fiołek polny, tasznik, ostróżeczka…) z ostrzeżeniem.
- **Ekoton – tab. 1 przeczy tab. 2** (opis z metodyki 6120: „brak strefy ekotonowej z lasem”). Obowiązuje tab. 2
  (stopniowe przejście = FV). Opcje: częściowa granica antropogeniczna i brak stopniowego przejścia (ostra granica z lasem)
  – U1; ostra granica z polami – U2; półki skalne – XX.
- **Granice przedziałów**: krzewy 10 i 25 → U1 (karta: 10% – U1); obce 5% → U1.
- **Propozycje niewprowadzone**: 2013–2014 „metodyka odpowiednia”; 2021 – storczyki tylko do priorytetowości, ekoton „nie
  ma wpływu na stan ochrony”, obce raczej do perspektyw. Modyfikacja 2022 zmieniła wyłącznie gatunki charakterystyczne.

## Przykład – Radomice (Ostoja nad Bobrem, 6210-3), 26.07.2008
Koordynator zanonimizowany („Jan Kowalski”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak w karcie**:
powierzchnia U1, gatunki charakterystyczne FV, obce U1 (nawłoć kanadyjska 3%), ekspansywne U1 (rajgras 3%), krzewy U1 (10%),
storczykowate U1 (2 gat.), ekoton U1 → struktura U1, perspektywy FV, ogólna U1. Udział FV 85%, U1 15%.
Podpowiedzi zgodne z ekspertem przy 6 z 7 wskaźników; jedyny rozjazd – gatunki charakterystyczne (5 gatunków: próg 2022
daje U1). Ze zdjęć fitosocjologicznych wychodzi 6 (dochodzi biedrzeniec mniejszy) – czyli FV i po nowemu.
Ostrzeżenia: transekt 20×100 m (metodyka: 200 m) i praktyka 2021 przy ekspansywnych.

Przeniesienia: współrzędne ucięte w przewodniku – do minut; literówka „Agronomia” → Agrimonia; krzewy w zdjęciach bez
warstwy → B; wiersz „Udział procentowy siedliska na transekcie” (100%, FV; spoza tab. 2) – do uwag; „Zagrożenia” →
A04.03, K02, I01; stary kod 141 Zarzucenie pasterstwa → A04.03, intensywność A → H, pusta kolumna „wpływ” → „-”.
