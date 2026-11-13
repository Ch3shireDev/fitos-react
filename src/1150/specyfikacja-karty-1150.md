# Specyfikacja karty 1150 – Zalewy i jeziora przymorskie (laguny)

Formularz karty obserwacji wg przewodnika GIOŚ (Zalewska-Gałosz 2010, cz. I, s. 36–45, tab. 1 i 2) z modyfikacją metodyki
z 17.07.2015 i praktyką oceny ze sprawozdania z monitoringu 2013–2014. Siedlisko priorytetowe – w karcie `*1150`.
Silnik wspólny (`src/7120`). Z `src/forest` brane są tylko generyczne klocki (`choiceIndicator`, `pickField`, `labelOf`) –
nic leśnego: własne pola stanowiska, własne zdjęcie fitosocjologiczne. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: podtyp (1150-1 zalewy / 1150-2 jeziora przybrzeżne), zbiornik, transekt nurkowy 50×30 m prostopadły do brzegu.
Zdjęcie: 1 na każdy jednorodny płat szuwaru, 5×5 m, Braun-Blanquet, wszystko w warstwie C. Termin: lipiec–wrzesień (ostrzeżenie poza).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | trend szuwaru trzcinowego + trend fitolitoralu niebagiennego (+ ha) | trzcina rośnie U2; trzcina ≤ i fitolitoral ≥ FV; inne U1; brak danych XX; ostrzeżenie przy braku hydrofitów |
| **Liczba zbiorowisk** | liczba albo lista; pusto → nazwy z „Zbiorowisk roślinnych” stanowiska | ≥4 FV, 2–3 U1, <2 U2 |
| **Obecność hydrofitów** | **spis transektu**: strefa A/B/C, gatunek, poletka z gatunkiem (na 10) + select | z selecta; frekwencja = poletka×10%, opis strefami do karty; ostrzeżenie „Brak” przy hydrofitach w spisie |
| Obecność ramienic | select | **pomocniczy** (2015) – pomijany w ocenie struktury; ramienice ze spisu transektu podpowiadają i ostrzegają |
| **Zasilanie wodami słonymi** | select | ciągłe/okazjonalne FV, sporadyczne U1, brak U2 |
| **Przezroczystość wody** | m (Secchi) | ≥0,5 FV, 0,2–0,5 U1, <0,2 U2 |
| **Azot ogólny** | mg/dm³ + forma (ogólny / nieorganiczny dla starych kart) | 0,3–6,5 FV, do 15 U1, <0,3 lub >15 U2 |
| **Fosfor ogólny** | mg/dm³ | ≤0,5 FV, 0,5–1,0 U1, >1,0 U2; <0,1 ostrzeżenie |
| **Zawartość chlorków** | mg/dm³ | >500 FV, 200–500 U1, <200 U2 |
| **Odczyn wody** | pH + przewodność (uzupełniająco) | 6,5–8,0 FV; 6,0–6,49 i 8,01–9,5 U1; reszta U2 (progi 2015) |

## Interpretacje
- **Azot**: od 2015 azot ogólny zamiast nieorganicznego, progi bez zmian. Pole „forma azotu” tylko do przepisywania starych kart.
- **pH**: progi z modyfikacji 2015 (przewodnik 2010 miał FV 6,5–7,5 – nieaktualne).
- **Ramienice**: pomocnicze – `excluded`. Do silnika doszło opcjonalne `IndicatorDef.excludedNote` (dopisek przy wskaźniku), bo domyślne „przy tym podtypie” z 91E0 tu kłamie. Jedyna zmiana poza `src/1150`, wsteczne zgodna.
- **Kardynalne**: lista z przewodnika = wszystkie wskaźniki struktury poza ramienicami (8).
- **Luki w progach**: Secchi 0,4–0,5 → U1; fosfor <0,1 → FV z ostrzeżeniem (tab. 2 i monitoring 2013 nie dają gorszej oceny); chlorki 500 → U1; azot 6,5 → FV.
- **Powierzchnia**: tab. 2 ma dwa warunki naraz, więc dwa selecty. Brak danych o trendzie → XX (praktyka 2013 przy pierwszym badaniu); trendy opcjonalne.

## Przykład
Jezioro Bukowo, stanowisko 2, 20.09.2008, wykonawca „Jan Kowalski”. Oceny jak w karcie: powierzchnia U1, struktura U1
(sporadyczne zasilanie + fosfor 0,781), perspektywy U1, ogólna U1. Azot oznaczony jako nieorganiczny (karta sprzed 2015).
Trendów powierzchni karta nie podaje – pola puste, ocena eksperta. Kody oddziaływań przepisane na słownik 2011 (210 → F02).
