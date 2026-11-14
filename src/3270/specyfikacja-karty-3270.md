# Specyfikacja karty 3270 – Zalewane muliste brzegi rzek

Formularz wg przewodnika GIOŚ (Nobis 2015, cz. IV, s. 141–152, tab. 1 i 2, przykładowa karta Sandomierz 2013) z praktyką ocen
ze sprawozdań z monitoringu 2013–2014, 2016 i 2023–2024 (metodyki nie zmieniano). Siedlisko nieleśne, niepriorytetowe, tylko
region kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian** (z `forest` tylko `speciesInput`, `pickField`,
`fmt`, `plNum`, `labelOf`). Rejestracja przez `meta.ts`.

Stanowisko: grupa małych płatów (1–10 m²) albo pas kilkunastu–kilkudziesięciu metrów; **bez transektu** (pole „Wymiary
transektu” z domyślnym opisem). 3 zdjęcia po 1–10 m² (domyślnie 2 m², jak w przykładzie), prawie wszystko w warstwie C.
Termin: wrzesień–październik (ostrzeżenie poza oknem), nie rzadziej niż co 5 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select zmiany + ha | rośnie/bez zmian/spadek naturalny FV, nieznaczny antropogeniczny U1, wyraźny U2, brak danych XX |
| Struktura przestrzenna płatów | select + odległość (m) + przyczyna + % na transekcie + opis | z selecta; bez wyboru z odległości: ≤5 FV, 5–10 U1, ≥10 U2 |
| **Gatunki charakterystyczne** | lista + liczba wprost + uwagi | >4 FV, 3–4 U1, <3 U2 |
| **Gatunki dominujące** | lista + opis | same typowe FV, typowe + ekspansywne/obce U1, tylko ekspansywne/obce U2 |
| Obce gatunki inwazyjne | lista z pokryciem | suma ≤25 FV, ≤50 U1, >50 U2 |
| Gatunki ekspansywne roślin zielnych | lista z pokryciem | suma ≤10 FV, ≤25 U1, >25 U2 |
| **Udział dobrze zachowanych płatów** | % + komentarz | ≥80 FV, 50–79 U1, <50 U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Wysoki stan wody → XX.** Sprawozdania 2021 i 2023–2024 dają XX wskaźnikom i powierzchni, gdy namuliska są zalane
  (10 z 33 stanowisk bez oceny ogólnej), a perspektywy oceniają normalnie. Nowe pole stanowiska „Stan wody w rzece”:
  przy „Wysoki” wszystkie wskaźniki podpowiadają XX z wyjaśnieniem. Dlatego pola pomiarowe wskaźników nie są wymagane –
  karta z samymi XX przechodzi walidację.
- **Powierzchnia – spadek naturalny.** Tab. 2 wiąże U1/U2 wyłącznie z czynnikami antropogenicznymi; spadek tylko przez
  stan wody/powódź → FV (osobna opcja). Sprawozdanie 2016: zmiany powierzchni mają „niewielki walor diagnostyczny”.
- **Granice:** charakterystyczne „więcej niż 4” → 5+ FV; obce „nie więcej niż 25%” → 25 FV, 50 → U1; ekspansywne
  10 → FV, 25 → U1 („przekracza 25%” to U2); dobrze zachowane 80 → FV; odległość 5 m → FV, 10 m → U2 („co najmniej 10 m”).
- **Gatunki charakterystyczne:** 21 gatunków z tab. 1 + 2 lokalnie charakterystyczne (Bidens radiata, Chenopodium
  acerifolium), synonimy (Persicaria/Polygonum, Oxybasis/Lipandra/Chenopodium, Filaginella) liczone raz. Chwastnica
  („stały udział”) i uczep amerykański (inwazyjny, choć gatunek Chenopodion fluviatile – problem zgłoszony w sprawozdaniu
  2013–2014) się nie liczą. Liczba wpisana wprost ma pierwszeństwo, z ostrzeżeniem o rozjeździe.
- **Gatunki dominujące** (tab. 2 opisowa): typowe = charakterystyczne + lokalne + chwastnica jednostronna; ekspansywne =
  mozga, trzcina, mietlica rozłogowa (2016); ekologicznie obce = inwazyjne, ruderalne, łąkowe, szuwarowe, siewki drzew
  i wszystko spoza katalogu (formularz to pokazuje).
- **Struktura przestrzenna:** fragmentacja wyłącznie naturalna przy wyborze U1/U2 → ostrzeżenie (tab. 2 wiąże niższe
  oceny z antropopresją). „Powierzchnia zajęta przez siedlisko na transekcie” (w karcie 80%, bez oceny) – pole
  informacyjne w tym wskaźniku.
- **Stanowisko:** dodane pola z karty przewodnika: typ stanowiska, Natura 2000 osobno od innych form ochrony, zarządzający
  terenem, stopień uregulowania koryta (metodyka każe go notować; sprawozdanie 2013–2014 proponowało osobny wskaźnik).
- **Udział powierzchni FV/U1/U2** (przy ocenie ogólnej w karcie) – jak w 2330: trzy liczby w „Innych informacjach”.
- **Kody oddziaływań:** słownik 2011, zestaw ze sprawozdań 2013–2014 (wędkarstwo, regulacja koryt, mosty, promy, piasek…).

## Przykład
Sandomierz, 20.09.2013, ekspert zanonimizowany („Jan Kowalski”, dodatkowy ekspert pominięty). **Oceny 1:1 z kartą:**
wszystkie wskaźniki FV, powierzchnia FV, struktura FV, perspektywy FV, ogólna FV; udział FV 100%; 16 gatunków
charakterystycznych; zdjęcia I–III (po 13 gatunków) jak w karcie. Rozbieżności (bez wpływu na oceny):
- pokrycie „<5%” (7 gatunków) nie mieści się w polu liczbowym silnika – puste, lista w uwagach wskaźnika;
- komosa czerwona „30–40%” → 40% (górna granica, jak w innych kartach);
- powierzchnia bez trendu w karcie → brak podpowiedzi, ocena FV wpisana jak u eksperta;
- „Wartość lub opis” generowana z pól, więc składnia minimalnie inna niż w druku (treść ta sama);
- zagrożenia z „Raportu rocznego” (opisowe) → J02.03 i F02.03; oddziaływanie F02.03, intensywność C → L, wpływ „–”;
- współrzędne w przewodniku ucięte – przepisane z „…”.
