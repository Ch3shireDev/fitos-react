# Specyfikacja karty 3140 – Twardowodne oligo- i mezotroficzne zbiorniki z podwodnymi łąkami ramienic (Charetea)

Formularz karty obserwacji wg przewodnika GIOŚ (Monitoring siedlisk przyrodniczych, cz. IV, rozdz. 3140, s. 120–139,
tab. 1 i 2, przykładowa karta Jezioro Budzisławskie 2013) z erratą „najgorszy decyduje” i praktyką oceny ze sprawozdań
2013–2014, 2016–2018 i 2023–2025. Siedlisko niepriorytetowe, tylko region kontynentalny. Silnik wspólny (`src/7120`) –
**bez zmian**. Z `src/forest` tylko generyczne klocki (`choiceIndicator`, `selectInput`, `speciesInput`, `pickField`,
`labelOf`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: całe jezioro (zwykle <50 ha) albo wydzielona część; transekt prostopadły do brzegu, do ok. 300 m (tyle, ile
sięga roślinność), w małym zbiorniku cały zbiornik – wymiary wpisywane tekstem. Pomiary PAR, pH, przewodności i plankton
z najgłębszego miejsca jeziora. Termin: przewodnik – koniec czerwca do końca sierpnia; ostrzeżenie dopiero poza
15.06–30.09 (praktyka 2013–2014, 2017 i 2024 uznana za zgodną z metodyką). Zdjęcia fitosocjologiczne opcjonalne (0
domyślnie), z polem głębokości. Nowe pola stanowiska: **Typ jeziora** (głębokie >5 m / płytkie o dużej powierzchni ok.
100 ha / płytkie), **Głębokość maksymalna jeziora**, **Zarządzający terenem**.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „nie da się określić” → brak podpowiedzi) + ha + opis | z selecta |
| **Struktura roślinności ramienicowej** | select zmiany powierzchni łąk (+ „pierwsze badanie”) + pokrycie dna % + opis | głębokie i duże płytkie: z selecta; płytkie: >50 FV, 10–50 U1, <10 U2 |
| **Gatunki charakterystyczne** | lista ramienic + liczba wprost | ≥4 FV, 2–3 U1, 0–1 U2 |
| **Gatunki wskazujące na degenerację, w tym obce** | lista z pokryciem + select ekspansywnych + select obcych + dopisek | gorszy z dwóch selectów |
| **Maksymalna głębokość łąk ramienicowych** | m | głębokie: >5 FV, 5–2,5 U1, <2,5 U2; płytkie: do dna FV, ≥1 m U1, <1 m U2 |
| **Zasięg strefy świetlnej (1% PAR)** | m + Secchi (informacyjnie) | głębokie: >15 FV, 15–10 U1, <10 U2; płytkie: do dna FV, ≥2,5 U1, <2,5 U2 |
| Odczyn wody | pH + pH poprzednio | wzrost ≤0,3 FV, ≤1,0 U1, >1,0 U2; bez poprzedniego 7,0–8,5 FV |
| Konduktywność | µS/cm + poprzednio | wzrost ≤5% FV, ≤20% U1, >20% U2; bez poprzedniego brak |
| Plankton: fitoplankton | select (+ „nie badano” = XX) + skład | z selecta |
| Plankton: zooplankton | select (+ „nie badano” = XX) + skład | z selecta |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Typ jeziora**: bez wyboru – z głębokości maks. (>5 m głębokie, 5 m to już płytkie). „Płytkie o dużej powierzchni”
  tab. 2 łączy z głębokimi tylko w strukturze roślinności; w głębokości łąk i strefie świetlnej obowiązują progi dla płytkich.
- **Granice**: głębokość łąk 5 m i 2,5 m → U1 (FV „>5”, U2 „<2,5”); strefa świetlna 15 i 10 m → U1; pokrycie dna 50 i
  10% → U1.
- **Płytkie – luki tab. 2**: łąki od 2,5 m do (nie)dna → U1, <0,5 m → U2; strefa świetlna 2,5 m–(nie)dno → U1. „Do dna” =
  wartość ≥ głębokości maks. jeziora; bez niej podpowiedzi nie ma (nie da się odróżnić FV od U1).
- **Struktura, pierwsze badanie**: tab. 2 każe wtedy określić skład syntaksonomiczny i zasięg litoralu, bez progu – opcja
  „pierwsze badanie” nie daje podpowiedzi, ocenia ekspert (2013–2014: pełna sekwencja zbiorowisk = FV).
- **Gatunki charakterystyczne**: liczą się tylko ramienice; synonimy raz (C. fragilis = C. globularis, C. delicatula =
  C. virgata). Obniżanie za spadek liczby gatunków względem poprzednich badań (praktyka 2013–2014) – ekspercko, w pomocy.
- **Degeneracja**: opcja FV „brak (albo pojedyncze, bez wpływu na łąki)” – z przykładowej karty (P. pectinatus bez wpływu
  = FV). Ostrzeżenia: gatunek obcy na liście przy „brak obcych”, suma pokrycia ekspansywnych z listy >10% bez U2.
- **pH i przewodność**: tab. 2 ocenia tylko wzrost względem wcześniejszych wyników. „Bez istotnych zmian” przyjęto jako
  wzrost ≤0,3 pH i ≤5% przewodności (dokładność pomiaru, wahania dobowe); spadek nie obniża oceny. Bez poprzedniego wyniku
  pH 7,0–8,5 (zakres z tab. 1) → FV, inaczej brak podpowiedzi; przewodność bez poprzedniego – brak podpowiedzi.
- **Plankton**: dwa wiersze jak w karcie z przewodnika (sprawozdania łączą je w „Fito- i zooplankton”). Nie badano → XX,
  co przy pomocniczym wskaźniku nie psuje struktury.
- **Ocena struktury**: jak w innych kartach (silnik) – kardynalny U2 → U2; FV, gdy kardynalne FV i żaden pomocniczy nie U2.
  To zgodne z erratą „najgorszy decyduje” i sprawozdaniem 2024 („obniżenie któregoś z kardynalnych obniża parametr”).
  Tab. 2 z przewodnika ma jeszcze starą regułę licznikową („wszystkie FV lub jeden U1” = FV) – nieaktualna.
- **Pominięte**: „Zawartość tlenu rozpuszczonego” (pomocniczy w 2013–2014 i częściowo 2017, nie ma go w przewodniku ani
  w 2024). Propozycja Secchiego zamiast PAR (sprawozdanie 2016–2018) nie weszła – Secchi tylko jako dana uzupełniająca.
- **Kody oddziaływań**: słownik 2011 (jak w przykładzie). 2024 używa nowego słownika (kategorie A–M, X) – do ewentualnej
  zmiany razem z innymi kartami.

## Przykład
Jezioro Budzisławskie (Anastazewo) stanowisko 1, 24.07.2013, wykonawcy zanonimizowani („Jan Kowalski”). Wskaźniki jak
w karcie: powierzchnia U1 (bez trendu, ocena eksperta), struktura roślinności FV (pierwsze badanie, ocena eksperta),
11 gatunków ramienic FV, degeneracja FV (P. pectinatus bez wpływu), głębokość łąk 15,4 m FV, strefa świetlna 20,3 m FV,
pH 8,45 FV, przewodność 535 µS/cm FV (eksperta – brak porównania), fito- i zooplankton FV, perspektywy FV.
Parametry: powierzchnia **U1**, struktura **FV**, perspektywy **FV** – jak w karcie.

**Rozbieżność:** ocena ogólna. Karta z 2013 r. ma **FV** („wszystkie FV lub dwa FV i jeden U1” – reguła sprzed erraty),
formularz liczy **U1** (silnik: każdy U1 → U1). Errata „najgorszy decyduje” weszła między cyklami 2013–2014 a 2016–2018
(sprawozdanie 2016–2018, pkt 9), więc wynik formularza to stan obecnej metodyki. Wymuszenie FV wymagałoby zmiany silnika
(`aggregateOverall`) – świadomie nie. Rozbieżność opisana w uwagach i komentarzu przykładu; test jej pilnuje.

Pozostałe: współrzędne w przewodniku celowo ucięte („50º 32’…’’N 20º 30’…’’E”) – przepisane jak są. Intensywność
oddziaływań A/B → H/M, wpływ „–” → „-”, oryginał dopisany w opisie. Zagrożenia z karty (tekst) rozpisane na kody:
J02.05 (wahania poziomu wody), H01.08 (gospodarka ściekowa), G01 (rekreacja), E01.03 (zabudowa letniskowa), G05.01
(fragmentacja szuwarów, dojścia, usuwanie ramienic) – przypisanie kodów to interpretacja. N2000, PK i OChK w „Obszarach
chronionych”; typ stanowiska, uzasadnienie monitoringu i oryginalna ocena ogólna w uwagach.
