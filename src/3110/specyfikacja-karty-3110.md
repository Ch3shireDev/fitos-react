# Specyfikacja karty 3110 – Jeziora lobeliowe

Formularz karty obserwacji wg przewodnika GIOŚ (Wilk-Woźniak, Kraska, Piotrowicz, Klimaszyk 2012, cz. II, s. 114–129,
tab. 1 i 2) z modyfikacją metodyki z 30.09.2015 (reguła oceny ogólnej) i praktyką ze sprawozdań z monitoringu
2009–2011, 2015–2018 i 2020–2021. Siedlisko niepriorytetowe – w karcie `3110`. Silnik wspólny (`src/7120`) bez zmian,
z `src/forest` tylko generyczne klocki (`choiceIndicator`, `pickField`, `labelOf`, `plNum`). Rejestracja przez `meta.ts`.

Stanowisko: jezioro albo wyraźnie wydzielona część jeziora; podtyp (opcjonalny, tylko do ostrzeżeń); transekt 30×30 m
w litoralu; łączna powierzchnia płatów w m² + rozbicie na zbiorowiska; współrzędne początku (koniec opcjonalny).
Zdjęcia fitosocjologiczne nieobowiązkowe (domyślnie 0). Termin: początek lipca – 15 września (ostrzeżenie poza).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | zmiana (select) + ubytek % | bez zmian / wzrost FV; ubytek <5 FV, 5–25 U1, >25 U2; brak danych XX |
| **Charakterystyczna kombinacja zbiorowisk** | syntaksony (pusto → z „Zbiorowisk roślinnych”), spis gatunków charakterystycznych z liczebnością, select, maks. głębokość roślinności | z selecta; ostrzeżenia przy sprzeczności spisu z wyborem |
| **Gatunki wskazujące na degenerację** | spis z liczebnością + select | brak FV, pojedynczo U1, zwiększają udział U2; moczarka → przypomnienie o I01 |
| **Barwa wody** | select + opis + mg Pt/dm³ | z selecta; mg Pt tylko do opisu |
| **Odczyn wody** | pH | 5,5–7,5 FV; 4,5–<5,5 i >7,5–8,5 U1; <4,5 i >8,5 U2 |
| **Konduktywność** | µS/cm | <100 FV, 100–250 U1, >250 U2 |
| **Przezroczystość wody** | m (Secchi) + „do dna” | >3,5 FV, 1,5–3,5 U1, <1,5 U2 |
| Plankton (fito- i zooplankton) | dwa selecty + opisy | **pomocniczy** – pomijany w ocenie struktury; niższa z dwóch ocen; „Nie badano” → XX |

## Interpretacje i rozbieżności z przewodnikiem
- **Reguła struktury.** Tab. 2 mówi „wszystkie FV lub jeden U1 → FV”. Formularz używa reguły silnika (każdy kardynalny
  poniżej FV obniża parametr), bo tak oceniano w praktyce: sprawozdanie 2020–2021 – „obniżenie oceny któregoś ze
  wskaźników kardynalnych skutkuje obniżeniem oceny całego parametru”. Wszystkie 6 wskaźników struktury jest kardynalnych,
  więc różnica dotyczy dokładnie przypadku „jeden U1”.
- **Ocena ogólna** wg modyfikacji z 30.09.2015 (wszystkie FV → FV, jakiś U1 bez U2 → U1, jakiś U2 → U2) – to robi silnik.
- **Powierzchnia.** Tab. 2 nie ma progów; wzięte z monitoringu 2009–2011 (zmiana <5% / 5–25% / >25%). Wzrost = FV.
- **Plankton** pomocniczy i nieobowiązkowy (2015–2021) – `excluded` z `excludedNote`. Silnik wymaga jednak wartości
  i oceny każdego wskaźnika do walidacji, dlatego jest opcja „Nie badano” (XX).
- **Maksymalna głębokość roślinności** (2021: dodatkowy kardynalny) – brak progów w metodyce, więc nie osobny wskaźnik,
  tylko opcjonalne pole w „Charakterystycznej kombinacji” (do opisu + kontrola z Secchim).
- **Granice progów:** pH 5,5 i 7,5 → FV, 4,5 i 8,5 → U1; przewodność 100 i 250 → U1; Secchi 3,5 i 1,5 → U1.
- **Podtypy dystroficzne:** pH 3,8–5,9 i brunatna woda bywają naturalne, a tab. 2 nie robi wyjątku – formularz
  nie zmienia podpowiedzi, tylko ostrzega.
- **Secchi „do dna”:** propozycja z 2015–2018 (jeziora <5 m: „do dna” = FV) nie weszła do metodyki – tylko ostrzeżenie.

## Przykład
Jezioro Chlewo, 09.2009, wykonawca „Jan Kowalski”. Oceny jak w karcie: wszystkie kardynalne FV, powierzchnia FV,
struktura FV, perspektywy FV, ogólna FV. Rozbieżności:
- data „09.2009” bez dnia → 01.09.2009 (formularz wymaga pełnej daty);
- fito- (FV) i zooplankton (U1) w karcie w dwóch wierszach – tu jeden wskaźnik pomocniczy z niższą oceną U1, na ocenę nie wpływa;
- barwa: literówka „Woda o przezroczysta” poprawiona, 8 mg Pt/dm³ w tym samym opisie;
- perspektywy w karcie bez opisu – wpisano notkę, bo pole jest wymagane;
- kody oddziaływań ze słownika 2009 → 2011: 251 → F04.01, 600 → G02; intensywność B → M, C → L; zagrożenie → G02;
- współrzędne w karcie obcięte („16°40′…″E, 53°56′…″N”) – przepisane jak są.
