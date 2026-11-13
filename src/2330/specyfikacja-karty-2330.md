# Specyfikacja karty 2330 – Wydmy śródlądowe z murawami napiaskowymi

Formularz karty obserwacji wg przewodnika GIOŚ (Kulpiński, Tyc 2012, cz. II, s. 102–113, tab. 1 i 2, przykładowa karta
Chechło 2) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2023–2025. Siedlisko nieleśne,
niepriorytetowe, tylko region kontynentalny. Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` tylko generyczne
klocki (`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 200×10 m; inny kształt dopuszczalny, byle 20 arów (ostrzeżenie, gdy nie 2000 m²). Zdjęcia: 3 × 25 m²
(dwa na końcach, jedno w środku), Braun-Blanquet, warstwy B, C, D. Termin: maj, ewentualnie początek czerwca (ostrzeżenie
poza majem–czerwcem – praktyka 2017–2018 i 2024: 1.05–30.06). Powtarzanie co 2–3 lata.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha + opis | z selecta |
| **Gatunki charakterystyczne** | lista + liczba wprost (opcjonalnie) + opis | ≥4 FV, 2–3 U1, 0–1 U2; liczba wprost > lista tab. 1 |
| **Ekspansja krzewów i podrostu drzew** | pokrycie % + lista + opis | <40 FV, 40–60 U1, >60 U2 |
| Gatunki ekspansywne | lista z pokryciem + łącznie wprost + „nie stwierdzono” | ≤1 FV, ≤10 U1, >10 U2 |
| Obce gatunki inwazyjne | lista z pokryciem + liczba/łącznie wprost + „nie stwierdzono” | 0 FV; 1 gat. ≤5% U1; >5% albo >1 gat. U2 |
| **Występowanie procesów eolicznych** | select + odsłonięty piasek % (info) + opis | z selecta |
| Procent powierzchni zajęty przez siedlisko na transekcie | % + opis | >30 FV, >10–30 U1, ≤10 U2 |
| Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska | lista + liczba wprost + „nie stwierdzono” | 0–1 FV, 2–3 U1, >3 U2 |
| Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie) | select + opis | z selecta |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Krzewy – granica 40%**: tab. 2 ma „do 40%” (FV) i „40–60%” (U1). Karta z przewodnika ocenia 40% na U1, więc 40% → U1
  (FV tylko <40%). 60% → U1 („powyżej 60%” to U2).
- **Ekspansywne – granica 1%**: „do 1%” FV vs „1–10%” U1. Karta: trzcinnik „pokrycie do 1%” → FV, więc 1% → FV; 10% → U1.
- **Udział siedliska – granica 10%**: tab. 2 ma „10–30%” (U1) i „do 10%” (U2). Sprawozdanie 2024: U2, gdy pokrycie
  „nie przekraczało 10%” → 10% to U2. 30% → U1.
- **Obce – jeden gatunek bez pokrycia**: tab. 2 wymaga pokrycia ≤5% dla U1; bez podanego pokrycia formularz przyjmuje U1.
  Liczy się każdy wpisany gatunek (2024 listowano też pospolite antropofity – pomoc ostrzega, że każdy się liczy).
  Synonimy (Padus/Prunus serotina, Conyza canadensis/Erigeron canadensis) liczone raz.
- **Gatunki charakterystyczne**: liczy się 12 gatunków z tab. 1 z synonimami (Spergula vernalis, Teesdalea, Cladonia mitis,
  Coelocaulon aculeatum, Agrostis coarctata). Karta z przewodnika liczy 5, w tym szczaw polny i „Cladonia sp.” spoza tab. 1
  (wg tab. 1 byłyby 3 → U1). Żeby przykład wyszedł jak w oryginale, wskaźnik ma pole „Liczba gatunków” wpisywane wprost,
  z pierwszeństwem przed listą; formularz ostrzega o rozjeździe z tab. 1. Przetacznik wiosenny Veronica verna (liczony w
  sprawozdaniu 2024) jest w katalogu jako towarzyszący – nie liczy się, można go doliczyć liczbą wprost.
- **Gatunki ekspansywne**: tab. 1 wymienia trzcinnik piaskowy i wydmuchrzycę. Sprawozdanie 2024 oceniało też trzcinnik leśny,
  perz właściwy, orlicę, jeżynę fałdowaną, trzęślicę, turzycę wczesną i owłosioną – są w katalogu („gatunek ekspansywny
  (sprawozdanie 2024)”), a formularz sumuje pokrycie wszystkich wpisanych.
- **Murawy/wrzosowiska**: liczy wszystkie wpisane gatunki poza gatunkami charakterystycznymi 2330 i gatunkami muraw 6120
  (strzęplica sina – wykluczona wprost w tab. 1 – oraz kostrzewa piaskowa, goździk piaskowy, łyszczec, kocanki). Rozchodnik
  ostry, macierzanka, kostrzewa owcza liczone (praktyka 2024). Obniżenie do U1 przy jednym gatunku o dużym pokryciu
  (sprawozdanie 2024, śmiałek 10%) – tab. 2 tego nie przewiduje, zostaje ekspertowi.
- **Procesy eoliczne – odsłonięty piasek**: propozycja ze sprawozdania 2016–2018 (>60% FV, 10–60% U1, <10% U2) nie weszła
  do metodyki (2024 oceniano po staremu). Pole jest opcjonalne, informacyjne: wskazówka w wyjaśnieniu i ostrzeżenie przy
  rozjeździe FV↔inne; ocena idzie z selecta.
- **Ocena struktury**: jak w innych kartach – FV, gdy kardynalne FV i żaden pozostały nie U2 (tab. 2: „pozostałe przynajmniej U1”).
- **Udział powierzchni FV/U1/U2**: metodyka każe szacować na transekcie udział siedliska o różnych stanach; karta ma go przy
  ocenie ogólnej. Silnik nie ma takiego pola, więc trafił do „Innych informacji” jako trzy liczby (bez zmian w silniku).
- **Kody oddziaływań**: słownik 2011 (jak w sprawozdaniach 2016–2018 i 2024). Karta z przewodnika ma stare kody 2010.

## Przykład
Chechło 2 (Pustynia Błędowska), 17.09.2011, obserwatorzy zanonimizowani („Jan Kowalski”). Oceny jak w karcie: powierzchnia FV,
gatunki charakterystyczne FV (liczba 5 wprost), krzewy U1 (40%), ekspansywne FV, obce U1 (wierzba ostrolistna 1–3% → 3%),
procesy eoliczne FV, udział 60% FV, murawy/wrzosowiska FV (1 gatunek), zniekształcenia U1 → struktura U1, perspektywy U1,
ogólna U1. Udział FV 70%, U1 10%, U2 20%. Zdjęcia I–III jak w karcie („Festuca sp.” zostaje; brak zwarcia/wysokości B
w zdjęciu I – puste). Współrzędne ucięte w przewodniku – do minut. Wartość powierzchni (w karcie pusta) – etykieta klasy.
Kody: 424 → E03.04, 622 → G01.02, 623 → G01.03, 730 → G04.01, 950 → K02; intensywność A/B/C → H/M/L, wpływ bez zmian;
stary kod i intensywność dopisane w opisie. Data wypełnienia (27.09.2011) i odstępstwa (transekt 20×100 m, termin wrzesień)
w uwagach. Zagrożeń karta nie ma – lista pusta.
