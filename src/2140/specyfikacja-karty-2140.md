# Specyfikacja karty *2140 – Nadmorskie wrzosowiska bażynowe

Formularz karty obserwacji wg przewodnika GIOŚ (Braun 2010, cz. I, s. 73–83, tab. 1 i 2) z praktyką oceny ze sprawozdań
z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne, **priorytetowe** (`*2140`).
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `listCover`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt zwykle nieregularny (płaty po kilkadziesiąt m²), 3 zdjęcia fitosocjologiczne po 4–16 m²
(domyślnie 9 m²), Braun-Blanquet, warstwy B/C/D. Powierzchnia płatów w **m²** (nie ha). Pole „Podtyp” (2140-1 / 2140-2) –
informacyjne, progów nie zmienia. Termin: lipiec – 15 sierpnia (ostrzeżenie poza). Kontrola co 3–4 lata, płaty U2 co 2 lata.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + m² + opis | z selecta; puste = ocena eksperta |
| **Charakterystyczna kombinacja florystyczna** | lista gatunków z % + pokrycie warstwy mszysto-porostowej (% płatu) + klasa + opis | z listy i mchów; bez mchów z selecta |
| Obce gatunki inwazyjne | lista z % + klasa | suma pokrycia <5% U1, ≥5% U2; bez pokrycia z selecta |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista z % + klasa | jak obce |
| **Gatunki nitrofilne** | lista z % + klasa | 1–2 gatunki <5% U1; któryś ≥5% albo >2 gatunki U2 |
| **Stan populacji: bażyna i wrzos** | % wrzosu, % bażyny, % pędów bez liści, żywotność, zasypywanie, opis | >50% bez liści U2; oba 0% U2; poza tym z selecta |
| **Występowanie abrazji** | select + opis | z selecta |
| **Obecność nalotu drzew** | lista drzew + % płatu + klasa + opis | <1% FV, 1–10% U1, >10% U2 |
| **Zniszczenia mechaniczne** | select + opis | z selecta |

## Interpretacje (dopowiedzenia do metodyki)
- **Kardynalne**: 7 z 8 wskaźników struktury, wszystkie poza obcymi inwazyjnymi (lista pod tab. 2). Sprawozdanie 2018
  proponowało zostawić tylko 2 kardynalne (kombinacja florystyczna, nalot drzew) – metodyki nie zmieniono, sprawozdanie
  2024 liczy 7, więc formularz też.
- **Skala Br.-Bl. a procenty**: „stopień pokrycia najwyżej 1” = pokrycie poniżej 5% (r, +, 1), „większy od 1” = 5% i więcej.
  Zgodne ze sprawozdaniem 2018 („U2 otrzyma gatunek zajmujący powyżej 5%”). Równo 5% to już stopień 2 → U2.
- **Obce / ekspansywne**: liczona suma pokrycia wszystkich gatunków z listy. Lista bez żadnego pokrycia → ocena z selecta.
- **Nitrofilne**: tab. 2 mówi „r lub 1” – „+” mieści się między nimi, więc też U1. Gatunek bez wpisanego pokrycia
  liczony jak pojedyncze osobniki (tak wygląda w praktyce 2014–2024). Katalog: nawłoć pospolita, wierzbówka kiprzyca
  (przewodnik), pokrzywa żegawka (karta przykładowa), pokrzywa zwyczajna (dopisana). Szczaw polny (U1 w Rowach 2018)
  **nie** jest w katalogu nitrofilny – to gatunek kwaśnych piasków.
- **Kombinacja florystyczna**: tab. 2 zostawia dziury. Przyjęto: „bogata i zwarta” warstwa mszysto-porostowa = ≥50% płatu
  (ten sam próg co w U1); brak krzewinek albo 0% mchów → U2; FV wymaga też „braku nalotów drzew” – brany z wskaźnika
  „Obecność nalotu drzew” (ocena U1/U2 albo pokrycie ≥1% odbiera FV); wszystko pomiędzy (2 krzewinki bez bażyny,
  mchy 1–49%) → U1 („inne kombinacje”). Krzewinki: bażyna, wrzos, borówka brusznica, czarna, bagienna. Wierzba
  piaskowa to niski krzew – do krzewinek się nie liczy.
- **Nalot drzew**: „pojedyncze siewki” = pokrycie poniżej 1% płatu (FV); „do 10% powierzchni” = U1; powyżej – U2
  („zwarte drzewa lub nalot”). Pokrycie ma pierwszeństwo przed wyborem klasy.
- **Stan populacji**: tab. 1 każe obniżać ocenę przy zasypywaniu krzewinek piaskiem, sprawozdanie 2024 – nie, dopóki pędy
  są żywotne. Formularz tylko ostrzega przy FV. Brak wrzosu i bażyny (0% / 0%) → U2 (praktyka 2024, SPN-b1).
- **Abrazja**: dodana opcja „stanowisko w głębi lądu” → FV (praktyka 2024).
- **Ekspansywne**: katalog – piaskownica (przewodnik) i trzcinnik piaskowy (dopisany). Gatunki wydmowe na ekotonie
  (turzyca piaskowa, szczotlica) wywołują ostrzeżenie, bo sprawozdanie 2024 cofnęło za nie oceny z 2018 r.
- **Powierzchnia**: tab. 2 ma U1 = „inne kombinacje” – w selecie „Inne kombinacje (np. niewielki spadek)”.
- **Perspektywy**: progi z tab. 2 dosłownie; tylko z oceny eksperta.
- **Kody oddziaływań**: stara lista (2011), jak w sprawozdaniach 2013–2018, uzupełniona o I01/I02, G01.03, M01.07.

## Przykład
Czołpino, 7.08.2008, koordynator zanonimizowany („Jan Kowalski”). Oceny jak w karcie: wszystkie wskaźniki FV →
powierzchnia FV, struktura FV, perspektywy FV, ogólna FV. Teksty „wartości” przepisane z karty dosłownie (także opis
stanu populacji wrzosu i bażyny). Współrzędne w przewodniku ucięte do minut – przepisane do minut. Zdjęcia: 9, 25, 9 m²,
zwarcia C/D 50/40, 20/80, 100/40; nachylenie „<5°” (zdjęcia I i II) nie mieści się w polu liczbowym – w uwagach.
Literówka „Cladonia cocifera” → C. coccifera. Karta nie ma kodów działalności człowieka („Ochrona ścisła w SPN” → uwagi);
zagrożenie „w perspektywie sukcesja do boru bażynowego” zapisane jako K02.01 (kod dopisany).
