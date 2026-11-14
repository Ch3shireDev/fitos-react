# Specyfikacja karty 3150 – Starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion, Potamion

Formularz karty obserwacji wg przewodnika GIOŚ (Wilk-Woźniak i in. 2012, cz. II, s. 130–149, tab. 1 i 2) z praktyką oceny
ze sprawozdań z monitoringu 2016–2018 i 2024 (cykl 2023–2025, „metodyka wraz z aktualizacją”). Siedlisko niepriorytetowe – `3150`.
Silnik wspólny (`src/7120`), z `src/forest` tylko klocki generyczne (`choiceIndicator`, `speciesInput`, `pickField`, `labelOf`, `plNum`).
Karta rejestruje się sama przez `meta.ts`. **Silnik bez zmian.**

Stanowisko: podtyp (3150-1 jeziora eutroficzne / 3150-2 starorzecza i drobne zbiorniki), zbiornik, zarządzający, transekt 10×100 m
(jak w przykładzie). Zdjęcia fitosocjologiczne roślinności wodnej opcjonalne (domyślnie 1, warstwa C, mchy D).
Termin: początek lipca – 15 września bez ostrzeżenia; 15–30 czerwca łagodne ostrzeżenie (cykl 2023–2025 to uznawał); reszta – „poza oknem”.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select + ha | bez zmian/wzrost FV, maleje U1, zanik U2, pierwsze badanie XX |
| **Charakterystyczna kombinacja zbiorowisk** | nymfeidy, elodeidy (tak/nie), % pleustofitów, % rogatka w elodeidach, kadłubowe, gatunek rzadki + opcjonalna lista gatunków | gatunek rzadki → FV; kadłubowe → U2; brak obu grup → U2; brak jednej → U1; rogatek >25% → U1; pleustofity >25% (jezioro) / >50% (starorzecze) → U1; inaczej FV. Puste pola uzupełniane z listy gatunków |
| **Gatunki wskazujące na degenerację** | lista + liczebność | pusta FV, pojedyncze U1, liczne U2; *Elodea canadensis* pomijana; ostrzeżenie, gdy obcy gatunek jest w liście transektu |
| **Konduktywność** | µS/cm | ≤600 FV, ≤900 U1, >900 U2 |
| **Przezroczystość wody** | Secchi m, do dna, głębokość | do dna lub >2,5 FV; 1,0–2,5 U1; <1,0 U2 (zbiornik <1 m bez dna → U1) |
| Barwa wody | select + własny opis | 3 opisy z tab. 2 |
| Odczyn wody (pomocniczy) | pH | 6,5–7,9 FV, 8,0–9,0 U1, >9 U2 |
| Fito- i zooplankton (pomocniczy) | grupa dominująca fitoplanktonu, % gat. eutroficznych w zooplanktonie, opisy | gorsza z dwóch; zoo <5 FV, 5–50 U1, >50 U2 |

Ocena struktury – reguła silnika: U2 przy kardynalnym U2; FV gdy kardynalne FV i żaden inny U2; inaczej U1.

## Interpretacje i dopowiedzenia
- **Kardynalność wg 2024, nie wg 2012.** Przewodnik ma 5 kardynalnych (z barwą wody). Sprawozdanie 2024 ocenia 7 wskaźnikami, z czego 4 kardynalne – barwa już nie (postulował to raport 2016–2018: barwa bywa humusowa i uznaniowa). Skutek: barwa U2 daje strukturę U1, nie U2. Zmiana to jedna linijka (`cardinal: true` w `colour`), gdyby trzeba wrócić do 2012.
- **Reguła liczenia z tab. 2** („wszystkie FV lub jeden U1 → FV; dwa–trzy U1 → U1”) nie jest używana – formularz stosuje zasadę kardynalnych z silnika, tak jak sprawozdanie 2024 („obniżenie któregoś kardynalnego obniża parametr”). Na przykładzie wynik ten sam.
- **Plankton = jeden wskaźnik** (tab. 1 i raporty: „Fito- i zooplankton”, gorsza z dwóch). Karta w przewodniku ma dwa wiersze.
- **Podtyp 3150-2**: wspólne progi i kardynalność (tak było w 2024). Złagodzone progi Secchiego dla starorzeczy z raportu 2016–2018 to tylko propozycja – nie wprowadzono, opisane w pomocy.
- **Luki w progach**: konduktywność 899–900 → U1; pH 7,9–8,0 → FV, pH <6,5 → U1 (tab. 2 milczy); Secchi 2,5 m → U1 (FV to „powyżej 2,5”); brak obu grup roślin → U2.
- **Powierzchnia**: tab. 2 nie ma progów – praktyka z raportów (zarastanie/zamulanie U1, zanik U2, pierwsze badanie XX).
- **Pola liczbowe wody nieobowiązkowe** – w 2024 r. 4% stanowisk dostało XX (brak pomiaru); opis w „wartości” i ocena XX.
- Kody oddziaływań: słownik 2011 (litery), wybrane z listy oddziaływań 3150 w raporcie 2016–2018.

## Przykład
Brzeg I (starorzecze Pilicy), 13.06.2011, wykonawca „Jan Kowalski”, bez koordynatorów. Oceny jak w karcie: powierzchnia FV, struktura FV,
perspektywy FV, ogólna FV; plankton U1. Rozbieżności:
- fitoplankton z dominacją okrzemek wg tab. 2 to FV, karta dała U1 (pewnie przez *Microcystis*) – łączny plankton i tak U1 przez zooplankton 5% (próg „od 5 do 50%”);
- data przed oknem metodyki – formularz ostrzega;
- „1,0 m” zapisane jako „1 m”; kody 424/502/952 → E03.04/D01.02/K02.03, intensywność A → H; perspektywy w karcie bez opisu – dopisano jedno zdanie (schemat wymaga opisu).
