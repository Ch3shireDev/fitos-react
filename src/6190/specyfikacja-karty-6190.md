# Specyfikacja karty 6190 – Murawy pannońskie (Stipo-Festucetalia pallentis)

**Uwaga na start: dla 6190 nie ma opublikowanego przewodnika metodycznego** (Świerkosz 2021 – maszynopis, cytowany
w sprawozdaniu 2024, ale niedostępny). Nie ma tab. 1, tab. 2 ani przykładowej karty. Formularz złożono z:
- **sprawozdania 2023–2025 (badania 2024)** – ma pierwszeństwo: 7 wskaźników struktury, 5 kardynalnych (podkreślone
  w tab. 2), praktyka oceny na 10 stanowiskach;
- **sprawozdania 2015–2018 (badania 2016)** – ten sam zestaw, „wg wstępnej metodyki, przyjętej dla podobnego typu
  siedliska – 6110”. Stąd progi liczbowe = tab. 2 przewodnika 6110 (2010), poprawione tam, gdzie praktyka 6190 jest
  jednoznaczna;
- propozycji docelowej metodyki z 2018 r. (inny zestaw wskaźników) – **nie weszła**, w 2024 r. oceniano po staremu.
  Użyta tylko w podpowiedziach.

Siedlisko niepriorytetowe, tylko region kontynentalny (Dolny Śląsk, ok. 2 ha w kraju). Silnik `src/7120` i `src/forest`
– **bez zmian**; struktura i ocena ogólna regułą ogólną (bez `structureRule`). Rejestracja przez `meta.ts`.

Stanowisko: pola jak w 6110 bez „Zestawu wskaźników” i drugiej kontroli; transekt opisowy, bez wymiarów domyślnych.
Zdjęcia: 3, bez narzuconej powierzchni, warstwy A–D. Termin: maj–lipiec bez ostrzeżeń, sierpień–wrzesień łagodne
ostrzeżenie (gatunki diagnostyczne widoczne do końca września – sprawozdanie 2024), poza tym ostre. Cykl 3–6 lat.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ XX) + powierzchnia + opis | z selecta |
| **Gatunki charakterystyczne** | lista + liczba wprost + „nie stwierdzono” | ≥4 FV, 2–3 U1, 0–1 U2 |
| **Gatunki dominujące** | lista (≥10%) + ocena ekspercka | typowe z kostrzewą bladą FV; typowe bez niej albo z domieszką obcych siedlisku U1; żaden typowy U2 |
| Obce gatunki inwazyjne | lista + łączne pokrycie + „nie stwierdzono” | 0 FV, ≤2% U1, >2% U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + łączne pokrycie + „nie stwierdzono” | 0 FV, ≤5% U1, >5% U2 |
| **Ekspansja krzewów i podrostu drzew** | lista + zwarcie wprost + „nie stwierdzono” | ≤1% (pojedyncze okazy) FV, ≤30% U1, >30% U2 |
| **Ocienienie muraw** | % lub zakres + opis | ≤10 FV, ≤20 U1, >20 U2 |
| Zniszczenia mechaniczne | rodzaj + % + opis | brak / naturalne FV; antrop. ≤20 U1, >20 U2 |

## Interpretacje (poza literą źródeł)
- **Progi z 6110**: sprawozdania nie podają progów 6190, mówią tylko, że metodyka wstępna to metodyka 6110. Przyjęto
  tab. 2 dla 6110. Bez udziału na transekcie i struktury przestrzennej (w 6190 ich nie oceniano), z ocienieniem jako
  kardynalnym (w 6110 usunięte w 2015 r., w 6190 – jest).
- **Ekspansja krzewów – „pojedyncze okazy” = FV do 1%**: tab. 2 6110 daje FV tylko za „brak”, ale w 6190 w 2016 i 2024 r.
  10/10 stanowisk FV przy pojedynczych różach, jabłoniach, jarzębach, osice, cisie („razem mniej niż 1%”). Propozycja 2018
  mówi wprost, że pojedyncze okazy nie pogarszają struktury. Litera 6110 dałaby U1 na połowie stanowisk – sprzeczność
  z praktyką za duża, żeby ją zostawić.
- **Gatunki charakterystyczne – katalog**: gatunki diagnostyczne wymieniane w sprawozdaniach (kostrzewa blada, zanokcice
  północna i skalna, paprotka, rozchodnik wielki, pięciornik srebrny, czyścica, ciemiężyk, czosnek skalny, przetacznik
  kłosowy, tymotka Boehmera, goździk kartuzek, rojownik) plus rozchodnik ościsty i ostry („rozchodniki” bez nazw w 2024).
  Kostrzewa owcza i mszaki – typowe, nieliczone (jak w 6110).
- **Gatunki dominujące – kostrzewa blada**: 2024 dał U1, gdy dominowały kostrzewa owcza i mszaki („zanik roślinności
  zielnej”), i gdy duży udział miał tasznik. Formularz: brak kostrzewy bladej wśród dominantów → najwyżej U1.
- **Tasznik pospolity** – w tab. 3 sprawozdania 2024 obok obcych, ale obce oceniono 10 × FV, a tasznik opisano przy
  ekspansywnych. Formularz: archeofit → ekspansywny. Obcy jest rumianek bezpromieniowy (2016).
- **Ekspansywne w 6190** to gatunki synantropijne (rdest ptasi, wiechlina roczna, mniszek, komosy, rdestówka, życica).
- **Ocienienie „słabe”** = do 10% (2016: „nie przekracza 10%”, 2024: „5–10%” – wszystko FV).
- **Zniszczenia** – luka 10–20% w tab. 2 liczona do U1. Kody oddziaływań: słownik 2011 (jak sprawozdanie 2016;
  2024 używa już grup A–X – nie przenoszono).

## Przykład – Ostrzyca stok zachodni (POGLĄDOWY)
Nie ma przykładowej karty, więc przykład złożono z opisu stanowiska w sprawozdaniach 2016 i 2024 i **wyraźnie oznaczono
jako poglądowy** (etykieta przycisku, uwagi). Oceny – jak wynikają ze sprawozdania 2024: ekspansywne U1 (pojedynczo rdest
ptasi, wiechlina roczna, mniszek), zniszczenia U1 (wydeptywanie), reszta FV → struktura U1, perspektywy U1, powierzchnia
FV, ogólna U1. Pokrycia, data, współrzędne (do minut) i wykonawca („Jan Kowalski”) – umowne; zdjęcia puste (sprawozdania
ich nie publikują). Podpowiedzi zgodne z ocenami przy każdym wskaźniku; zniszczenia bez procentu → brak podpowiedzi
(ocena ręczna), bez ostrzeżeń.

## Rozjazdy i dziury w źródłach
1. **Sprawozdanie 2024 łamie regułę kardynalnych**: ekspansywne (kardynalny) U1 na 3 stanowiskach, a Czyżynki – południe
   ma charakterystyczne U2 i dominujące U1 – to 4 stanowiska z niekorzystnym kardynalnym, a struktura U1 tylko na 3,
   U2 na żadnym. Wąwóz Pełcznicy – żółty szlak (ekspansywne U1) wychodzi więc na FV wbrew regule. Formularz liczy regułą.
2. **Czyżynki – południe 2024**: 3 gatunki charakterystyczne → U2 (ekspert: „niskie stopnie pokrycia”), progi dają U1.
3. **2016, Ostrzyca – szczyt**: 1 okaz rdestu ptasiego „nie jest podstawą do obniżenia” – progi dają U1. Zostaje ocenie
   eksperta, formularz pokaże „odbiega od progów”.
4. **Tab. 2 sprawozdania 2016**: suma ocen „Gatunki charakterystyczne” = 9 przy 10 stanowiskach.
5. **Propozycja 2018** (kombinacja florystyczna, pokrycie mszaków, wydeptywanie, ślady zgryzania – 4 kardynalne)
   nie weszła; jak wejdzie przewodnik Świerkosza, karta do przeróbki.
