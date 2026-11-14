# Specyfikacja karty 3160 – Naturalne, dystroficzne zbiorniki wodne

Formularz karty obserwacji wg przewodnika GIOŚ (Wilk-Woźniak, Gąbka i in. 2012, cz. II, s. 150–169, tab. 1 i 2)
z praktyką oceny ze sprawozdań z monitoringu 2009–2011 i 2016–2018. Siedlisko niepriorytetowe – kod `3160`.
Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**. Z `src/forest` tylko klocki generyczne (`choiceIndicator`,
`measureIndicator`, `pickField`, `labelOf`, `gradeMap`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: typ jeziora (makrofitowe / bez roślinności – zmienia progi zmian), głębokość maksymalna (do „Secchi do dna”),
przełącznik „Oznaczenie DOC/DIC”, transekt prostopadły do brzegu albo cały mały zbiornik. Zdjęć fitosocjologicznych
metodyka nie wymaga (domyślnie 0, można dodać). Termin: od początku lipca do połowy września (ostrzeżenie poza).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia | select + opcjonalna zmiana % | ≥−10% FV, do −30% U1, ≤−30% U2, brak danych XX |
| **Gatunki charakterystyczne** | spis „gatunek / udział” (tekst, np. `<60%`) + select | brak roślin naturalny lub wątpliwy → FV (ostrzeżenie, gdy inne wskaźniki nie są FV); spadek <20% U1, >20% U2 |
| **Rodzime ekspansywne** | % pokrycia + nazwy | 0 FV, ≤5% U1, >5% U2 |
| **Obce inwazyjne** | select + nazwy | moczarka kanadyjska nie obniża; pojedyncze U1, liczne U2 |
| **Barwa wody** | mg Pt/dm³ albo opis wizualny | ≤50 FV, ≤100 U1, >100 U2; pomiar ma pierwszeństwo |
| **Odczyn** | pH + opcjonalnie poprzednie pH / ocena zmiany | 3–7 FV, 7–8 i 2–3 U1, >8 i <2 U2; zmiana niekorzystna ≥0,5 U2 |
| **Konduktywność** | µS/cm + poprzednia / zmiana | <100 FV, 100–500 U1, >500 U2; wzrost ≥20 (makrofitowe ≥50) U2 |
| **Melioracje** | select + liczba rowów, połączenie | brak/zneutralizowane FV, niewielki wpływ U1, wyraźny U2 |
| **HDI** | DOC, DIC (albo gotowy HDI) | wzór Górniaka z pH i EC innych wskaźników; >50 FV, 40–50 U1, <40 U2 |
| Przezroczystość | m + do dna? + poprzednia / zmiana | do dna lub >1,5 FV, 0,5–1,5 U1, <0,5 U2; spadek ≥20% U2 |
| Plankton | select + dominanty | pomocniczy – poza oceną |
| TDS | mg/dm³ + poprzednia / zmiana | pomocniczy – poza oceną; pierwsze badanie <60/60–100/>100, potem tylko zmiana |

## Interpretacje
- **Ocena struktury i ogólna – rozbieżność z tab. 2.** Tab. 2 daje strukturze FV przy „wszystkie FV lub jeden U1”, a ocenie
  ogólnej FV przy „dwóch FV i jednym U1”. Silnik liczy jak w pozostałych kartach: każdy kardynalny U1 → struktura U1,
  każdy parametr U1 → ogólna U1. Wymuszenie reguły z tab. 2 wymagałoby haka w `assessCard` (wspólny silnik, równolegle
  ruszają go inne wątki) – nie robiłem. Przykład z przewodnika (wszystko FV) tego nie dotyka.
- **Zmiana względem poprzedniego badania** (pH, przewodnictwo, przezroczystość, TDS): tab. 2 mówi „bez istotnych zmian” FV,
  „wzrost o mniej niż X” U1, „o więcej” U2. Liczę dosłownie (każda niekorzystna zmiana > 0 → U1), a obserwator może wybrać
  „bez istotnych zmian” w polu „Zmiana” – wybór ma pierwszeństwo; sprzeczność z progiem U2 ostrzega. Ocena = gorsza
  z wartości bezwzględnej i zmiany; dla TDS tab. 2 wprost: wartość bezwzględna tylko przy pierwszym badaniu.
- **Kierunek zmian**: w jeziorach makrofitowych niekorzystny jest spadek pH (wzrost dopuszczalny), progi wzrostu
  przewodnictwa/TDS 50 zamiast 20.
- **HDI**: kardynalny. Gdy DOC/DIC nie oznaczono (2011 r., 21% stanowisk w 2016) – pole stanowiska „Oznaczenie DOC/DIC:
  Nie” wyłącza go z oceny (wskaźnik zostaje z XX), bo inaczej XX kardynalnego dawałoby XX całej strukturze. Ten sam trik
  co pole „Kondycja traw” w 2120.
- **Pomocnicze**: plankton i TDS `excluded` (2016: „jako pomocniczy nie podlegał ocenie”). Przezroczystość – też „pomocnicza”
  w tab. 2, ale w 2016 oceniana na równi z innymi, więc jest niekardynalna (U1 nie psuje FV, U2 blokuje FV).
- **Przezroczystość do dna** → FV, zmiana się wtedy nie liczy (ogranicza ją dno, nie woda).
- **Luki w progach**: barwa 50–51 → FV, 100–101 → U1; HDI 50 → U1; pH 3 i 7 → FV.

## Przykład
Jezioro Kuźniczek (rez. „Kuźnik”), 12.08.2011, wykonawca „Jan Kowalski”. Wychodzi jak w oryginale: wszystkie wskaźniki FV,
powierzchnia, struktura, perspektywy i ocena ogólna FV. Dopowiedzenia:
- karta nie ma wiersza HDI – „Oznaczenie DOC/DIC: Nie”, HDI = XX poza oceną;
- przezroczystość 2,1 m = głębokość maks. 2,1 m → „do dna”;
- plankton FV mimo Gonyostomum semen jako pierwszego dominanta (tab. 2 dopiero „masową obecność” daje U1) – zostawione jak w karcie;
- kody oddziaływań 160/164/501 przepisane na B02/B02.02/D01.01, intensywność A → H; zagrożenie z opisu → K02.01;
- literówka „Peridinium incospicuum” poprawiona na P. inconspicuum, współrzędne wykropkowane jak w karcie.
