# Specyfikacja karty 1210 – Kidzina na brzegu morskim

Formularz karty obserwacji wg przewodnika GIOŚ (Ogrodniczuk, Mróz 2015, cz. IV, s. 46–55, tab. 1 i 2) z praktyką oceny
ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne, niepriorytetowe.
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt wzdłuż brzegu 400×20 m (linia przejścia obserwatora, ±10 m), dopuszczalnie 100–400 m.
Spisy roślin: 3 domyślnie, po 2 m² (jak w karcie z przewodnika), w miejscach największego nagromadzenia kidziny,
Braun-Blanquet, warstwa C. Termin: czerwiec–październik (ostrzeżenie poza).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha | z selecta; puste = ocena eksperta |
| **Gatunki charakterystyczne** | lista z pokryciem % + select udziału płatów | z selecta; ostrzeżenie, gdy na liście brak 6 gatunków z tab. 1 albo są spoza niej |
| Procent transektu z kidziną | długość odcinków z kidziną + długość transektu, albo %, albo klasa | >30 FV, 10–30 U1, <10 U2 |
| Naturalna działalność fal i sztormów | select + opcjonalny % transektu z ograniczeniem + opis | do 30% FV, >30% U1, cały U2 |
| Gatunki obce ekologicznie lub geograficznie | lista + select | z selecta; lista sprawdza: 1 nieekspansywny U1, 1 ekspansywny lub 2+ U2 |
| **Zniszczenia mechaniczne** | select + opcjonalny % płatów + opis | <10 FV, 10–50 U1, >50 U2 |
| **Zaśmiecenie** | select + opcjonalny % płatów + opis | <10 FV, 10–50 U1, >50 U2 |

## Interpretacje
- **Nazwy**: etykiety z przewodnika 2015. SI MGSP i sprawozdania używają innych nazw – „Pokrycie transektu przez kidzinę”,
  „Gatunki obce geograficznie”, „Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)” – są podane w opisach wskaźników.
- **„Pokrycie przez typowe rośliny jednoroczne osadzonej materii organicznej”**: pominięty. W SI MGSP wciąż wisi, ale wg
  sprawozdań 2018 i 2024 „zgodnie z aktualną metodyką nie podlega ocenie”, a przewodnik nie daje mu progów.
- **Granice**: 10% i 30% w procencie transektu → U1; 10% i 50% w zniszczeniach i zaśmieceniu → U1; 30% w falach → FV.
- **Fale**: „brak ograniczeń” to osobna opcja FV (przykład z przewodnika), obok „ograniczenie do 30%”.
- **Gatunki obce**: FV w tab. 2 to „brak gatunków ekspansywnych” – formularz traktuje go jak brak gatunków obcych
  (praktyka 2024: pojedynczy nieekspansywny rzepień brzegowy dostawał U1). Ekspansywne w katalogu: róża pomarszczona,
  wierzba ostrolistna, rdestowiec, nawłoć późna, czeremcha amerykańska, klon jesionolistny, kolczurka, niecierpek drobnokwiatowy.
- **Gatunki charakterystyczne**: liczba płatów jest z oka, więc ocena z selecta; synonimy (Tripleurospermum maritimum,
  podgatunki) rozpoznawane.
- **Ocena struktury**: tab. 2 mówi „pozostałe w większości przynajmniej U1”, silnik liczy „żaden pozostały nie U2” – jak w innych kartach.

## Przykład
Orzechowo, 18.09.2013, wykonawca „Jan Kowalski” (dodatkowy ekspert pominięty). Oceny jak w karcie: powierzchnia U2,
struktura U1 (gatunki charakterystyczne i zaśmiecenie U1, procent transektu U2 niekardynalny), perspektywy XX, ogólna U2.
Współrzędne w przewodniku są ucięte do minut – przepisane do minut. Karta nie ma opisu perspektyw, a formularz go
wymaga – wpisana krótka notka. Intensywność oddziaływań A → H, C → L.
