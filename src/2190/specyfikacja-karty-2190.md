# Specyfikacja karty 2190 – Wilgotne zagłębienia międzywydmowe

Formularz karty obserwacji wg przewodnika GIOŚ (Izydorek 2015, cz. IV, s. 87–105, tab. 1 i 2) z praktyką oceny ze
sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne, niepriorytetowe, 7 podtypów.
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `listCover`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: liniowy transekt 200 m, 3 skompleksowane zdjęcia fitosocjologiczne (początek, centrum, koniec) obejmujące całą
szerokość zagłębienia, domyślnie 100 m² (jak w karcie z przewodnika). Rów 40–200 m – trzy zdjęcia na krótszym odcinku;
zagłębienia <0,5 ha – trzy zdjęcia w trzech sąsiednich zagłębieniach (opis w pomocy pola „Wymiary transektu”).
Termin: lipiec–sierpień (ostrzeżenie poza). Warstwy a, b, c, d – zwarcie i wysokość.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha + opis | z selecta |
| **Gatunki charakterystyczne i wyróżniające** | lista z pokryciem + liczba ręczna + opis | liczba gatunków podtypu: FV od 5 (podtypy 1–5) / od 4 (6–7), U1 od 3, U2 ≤2 |
| Gatunki dominujące | lista z pokryciem + opis | ekspansywny/obcy/drzewo wśród dominantów U2; >50% w warstwach naczyniowych U1; spoza listy charakterystycznych U1; reszta FV |
| Obce gatunki inwazyjne | lista + „jak występują” + łączne pokrycie | pojedyncze o niskiej inwazyjności FV; więcej, ≤5% U1; >5% U2; silnie inwazyjne: pojedyncze U1, więcej U2 |
| Gatunki ekspansywne | lista z pokryciem albo łączne pokrycie | łącznie >50% U2; silnie ekspansywny obecny U1; reszta <20% FV, ≥20% U1 |
| Obecność nalotu i podrostu drzew | lista / łączne pokrycie / klasa | <5% FV, 5–10% U1, >10% U2 |
| **Obecność krzewów i krzewinek** | lista / łączne pokrycie / klasa | >10% FV, 5–10% U1, <5% U2; podtyp 7 – brak podpowiedzi |
| **Udział dobrze zachowanych płatów siedliska** | % albo klasa | ≥80 FV, 50–79 U1, <50 U2 |
| Pionowa struktura roślinności | select + pokrycie c, d + opis | z selecta |
| Występowanie procesów eolicznych | select + opis | brak FV, niewielkie U1, intensywne U2 |

Pierwszeństwo danych: liczba wpisana ręcznie > suma pokryć z listy > klasa z selecta. Pole „Opis” każdego wskaźnika,
gdy wypełnione, trafia do „wartości” w karcie (tak zapisany jest przykład – wartość i opis z karty papierowej).

## Interpretacje
- **Podtyp** (nowe pole w „Stanowisku”, wymagane): tab. 2 podaje progi gatunków charakterystycznych osobno dla 7 podtypów.
  Transekt bywa mozaiką podtypów (sprawozdanie 2016–2018: to normalna toposekwencja) – wybiera się przeważający.
  Bez podtypu gatunki charakterystyczne nie dostają podpowiedzi.
- **Gatunki charakterystyczne – progi**: „więcej niż 4” = od 5, „więcej niż 2” = od 3. Podtyp 2: FV „4 i 5”, U1 „3 i 4” –
  4 jest w obu klasach; liczone do U1 (FV od 5, jak w podtypach 3–5). Luki (np. 4 gatunki w podtypie 4:
  FV 5, U1 3) liczone do U1. Liczą się tylko gatunki z listy tab. 1 dla wybranego podtypu; ten sam gatunek pod
  synonimem albo odmianą (Polytrichum commune / var. perigoniale, Juncus articulatus / subsp. litoralis, Carex curta /
  canescens, Vaccinium oxycoccos / Oxycoccus palustris, Salix repens subsp. arenaria / S. arenaria) liczony raz.
  Gatunki innych podtypów – ostrzeżenie, nie liczą się.
- **Kardynalne**: wg listy pod tab. 2 – gatunki charakterystyczne, krzewy i krzewinki, dobrze zachowane płaty.
  Sprawozdanie 2024 też mówi o 3 kardynalnych z 9 wskaźników.
- **Gatunki dominujące**: płonnik 75% w przykładzie z przewodnika ma ocenę FV, więc „silna dominacja (>50%)” liczona jest
  tylko w warstwach roślin naczyniowych (b, c) – mszaki (warstwa D) się nie liczą (sprawozdanie 2024: „dominują tu
  (poza warstwą D)…”). „Ekologicznie obce” = drzewa (siedlisko nieleśne; Krynica Morska 2024 – bór bagienny → U2) i
  gatunki obce geograficznie. Dominant z katalogu, ale spoza listy charakterystycznych żadnego podtypu → U1 (nie spełnia
  FV „status dominanta osiągają gatunki charakterystyczne”). Gatunki spoza katalogu – tylko ostrzeżenie.
- **Gatunki ekspansywne**: silnie ekspansywne = trzęślica, sit rozpierzchły, ponikło błotne (tab. 1) i trzcina (opis s. 93).
  Trzęślica w podtypie 6 i trzcinnik lancetowaty w podtypie 5 są charakterystyczne – tam nie są ekspansywne.
  Luka w tab. 2: silnie ekspansywny >10% przy sumie ≤50% → U1 (praktyka 2024: trzęślica 30–60%, sit do 30% – U1).
  Równo 50% → U1 (U2 dopiero „>50%”), równo 20% → U1 (FV „<20%”). Bez pokryć i bez silnie ekspansywnych – brak podpowiedzi.
- **Obce gatunki**: tab. 2 daje FV za pojedyncze osobniki gatunków o niskim stopniu inwazyjności; sprawozdania 2013 i
  2024 dawały za nie U1 (sit chudy, wejmutka, świerk) – formularz trzyma się tab. 2, rozbieżność opisana w pomocy.
  Równo 5% → U1 (U2 dopiero „>5%”). Gatunek spoza katalogu traktowany jak o niskim stopniu inwazyjności. Silnie
  inwazyjne w katalogu: czeremcha amerykańska, róża pomarszczona, świdośliwa kłosowa, dąb czerwony (dopowiedzenie –
  przewodnik nie podaje listy).
- **Krzewy i krzewinki**: kierunek progów odwrotny niż przy drzewach (więcej = lepiej) – to nie błąd, potwierdza to
  przykład z przewodnika (Erica 25%, Salix arenaria 15% → FV) i sprawozdanie 2013–2014 („wskaźnik właściwy i pożądany”).
  Podtyp 7: tab. 1 mówi, że liczne krzewinki nie są tam właściwe – formularz nie podpowiada, ocena ekspercka.
  Granice: 10% → U1 (FV „>10%”), 5% → U1. Praktyka 2024 stosowała progi z tolerancją (3% i 11% → U1) – formularz nie.
- **Nalot drzew**: 5% → U1, 10% → U1 (U2 „>10%”).
- **Procesy eoliczne**: przykład z przewodnika ma „nieznaczne” zasypywanie z oceną FV, a tab. 2 daje za „niewielkie” U1.
  Przykład wczytuje się z wyborem „Niewielkie” i oceną eksperta FV – formularz pokazuje „odbiega od progów (U1)”,
  a uzasadnienie jest w opisie wskaźnika. Struktura i ocena ogólna wychodzą FV jak w oryginale.
- **Ocena struktury**: tab. 2 FV „wszystkie kardynalne FV, większość pozostałych przynajmniej U1”, silnik liczy „żaden
  pozostały nie U2” – jak w innych kartach.
- **Termin**: lipiec–sierpień. Przykład (3.09.2013) dostaje miękkie ostrzeżenie – zgodnie z przewodnikiem („lipiec (sierpień)”).
- **Kody oddziaływań**: stara lista (2011), jak w przykładowej karcie i sprawozdaniach 2013–2018 (K02, K01, J02, B01, I02…).
  Intensywność A/B/C → H/M/L.

## Przykład
Madwiny 1, 03.09.2013, podtyp 1, wykonawca „Jan Kowalski” (w przewodniku – autor rozdziału). Oceny jak w karcie:
gatunki ekspansywne U1 (Phragmites australis – silnie ekspansywny), reszta FV → struktura FV, perspektywy FV, ogólna FV.
Współrzędne w przewodniku są ucięte do minut – przepisane do minut. Zdjęcia: 3 × 100 m², zwarcie C 80%, D 80/80/70%,
wysokość C 60/50/50 cm, D 10 cm, gatunki z warstwami jak w karcie (literówka „Areneria” poprawiona, „Carex cf. flava” →
Carex flava). „Zagrożenia”, „Typ stanowiska”, „Zarządzający”, „Uwagi dodatkowe” i udział FV 90% / U1 10% – w uwagach.
Zagrożenia (karta nie ma pola intensywności zagrożeń) – intensywność dopisana w opisie.
