# Specyfikacja karty 91XX – Olsy (Carici elongatae-Alnetum)

Formularz karty obserwacji wg przewodnika GIOŚ (Pawlaczyk 2015, cz. IV, s. 290–313, tab. 1 i 2), z erratą GIOŚ z 30.09.2015
i zestawem 12 wskaźników ze sprawozdania z monitoringu 2024. Olsy nie są siedliskiem z zał. I dyrektywy – „91XX” to kod
roboczy GIOŚ, bez gwiazdki. Silnik wspólny (`src/7120`), klocki leśne z `src/forest`. Karta rejestruje się sama przez `meta.ts`.

Transekt 100×40 m (linia 100 m + pas po 20 m = 0,4 ha), 3 zdjęcia po 200 m². Termin: lipiec–sierpień (ostrzeżenie poza).

## Wskaźniki (kolejność tab. 2, pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select | opisowo wg tab. 2 |
| **Charakterystyczna kombinacja florystyczna** | lista gatunków (opcjonalna) + select | ekspercko; licznik 17 gatunków typowych; ostrzeżenie przy ≥25% gatunków łąkowych/pleustofitów/obcych |
| Gatunki obce geograficznie w drzewostanie | lista z udziałem + odnawianie | <5 FV, 5–15 U1, >15 U2; odnawianie U2 |
| Inwazyjne gatunki obce w podszycie i runie | lista z pokryciem | brak FV; 1 gatunek ≤25% U1; więcej albo >25% U2 (*interpretacja* „bardzo silnie ekspansywny”) |
| Funkcja ekohydrologiczna w krajobrazie | select | opisowo |
| **Warunki wodne** | select (4 opcje: U2 = przesuszenie z murszem albo antropogeniczne stałe zalanie) + mursz + poziom wody | z wyboru; ostrzeżenie: mursz przy ocenie lepszej niż U2 |
| Obecność rowów odwadniających | select | opisowo; ostrzeżenie, gdy „wyraźne przesuszenie” a warunki wodne „naturalne” |
| Objawy eutrofizacji wód | select | opisowo |
| Martwe drewno (łączne zasoby) | **spis fragmentów** (rodzaj, średnica, długość) albo gotowy wynik m³/ha | walce π/4·d²·l, suma / pow. transektu z pola „Wymiary transektu”; >20 FV, 10–20 U1, <10 U2 |
| Martwe drewno wielkowymiarowe | próg grubości (dom. 30 cm) albo gotowe szt./ha | liczone z tego samego spisu: d ≥ próg i l ≥ 3 m (granice włącznie – tak wychodzi 17,5 w karcie wzorcowej); >5 FV, 3–5 U1, <3 U2 |
| Mikrosiedliska drzewne | **spis drzew z kodami** (H, Ob, Os, Rz, Pr, Pk, Dz, DzP, Wk, S) albo gotowe szt./ha | różne kody na drzewie osobno, ten sam raz; >20 FV, 10–20 U1, <10 U2; ostrzeżenie o regule „≥1 z 3 wskaźników drewna FV” |
| Inne zniekształcenia, w tym zniszczenia po pozyskaniu drewna | select | brak / mało znaczące / silne |
| Stan gatunków kluczowych (fakultatywny) | select | „Brak danych” = XX |

## Interpretacje
- **Kardynalne: 2** – kombinacja florystyczna i warunki wodne. Przewodnik 2015 wymienia tylko warunki wodne, errata z 30.09.2015 i sprawozdanie 2024 dodają kombinację florystyczną. Sprawozdanie 2015–2018 mówi o jednym – przyjęto stan najnowszy.
- Gatunki obce w drzewostanie i inwazyjne w runie – zwykłe (kardynalne były do 2014 r.).
- Reguła tab. 2 „FV struktury wymaga co najmniej jednego FV wśród 3 wskaźników drewna” nie jest w silniku – formularz tylko ostrzega przy mikrosiedliskach.
- Luki w progach: 5% i 15% obcych → U1; 20 m³/ha → U1; 5 i 3 szt./ha → U1; 20 i 10 mikrosiedlisk/ha → U1.
- Przykład: drzewa „S” – przewodnik pisze >120 lat, karta wzorcowa >150 lat; przyjęto 120.

## Przykład
Kozi Rynek (Ostoja Augustowska), 7.08.2013, wykonawca „Jan Kowalski”. Zdjęcia 100 m² jak w karcie. Wszystkie parametry FV.
Spis martwego drewna daje 24,5 m³/ha (karta 24,4 – zaokrąglenie π) i 17,5 szt./ha drewna wielkowymiarowego (jak w karcie).
Jedyna różnica z ekspertem: mikrosiedliska – spis daje 17,5/ha → U1, w karcie „Nie oceniono” (XX).
