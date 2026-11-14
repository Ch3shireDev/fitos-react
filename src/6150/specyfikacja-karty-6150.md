# Specyfikacja karty 6150 – Wysokogórskie murawy acidofilne (Juncion trifidi) i bezwapienne wyleżyska śnieżne (Salicion herbaceae)

Formularz karty obserwacji wg przewodnika GIOŚ (Kozak, Kozłowska, Mróz 2012, cz. II, s. 282–298, tab. 1 i 2, przykładowa
karta Kopa Kondracka) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 (badania 2016) i 2020–2021.
Siedlisko niepriorytetowe, region alpejski (Tatry, Babia Góra, Bieszczady) i kontynentalny (Karkonosze, Śnieżnik).
Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna liczone regułą ogólną (bez
`structureRule`) – tab. 2 6150 mówi dokładnie to samo. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: podtyp (6150-1…4, wymagany), nazwa obszaru (pasmo), transekt ok. 100–200 × 10–15 m (ostrzeżenie poza
zakresem; w karcie 120×10 m), współrzędne początku, środka i końca. Zdjęcia: 3 × 25 m² (ostrzeżenie poniżej), warstwy A–D.
Termin: koniec czerwca – koniec sierpnia (ostrzeżenie poza 20.06–10.09); monitoring co 6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | z selecta (tab. 2 nie podaje progów) |
| Ekspansja borówki czarnej | pokrycie % + „nie stwierdzono” | <10 FV, 10–50 U1, >50 U2 |
| **Ekspansja krzewów i podrostu drzew** | lista + łączne zwarcie + „nie stwierdzono” | <10 FV, 10–25 U1, >25 U2 |
| **Gatunki charakterystyczne** | lista + liczba wprost + ocena | >5 FV, 3–5 U1, <3 U2 |
| **Gatunki ekspansywne** | lista + „nie stwierdzono” + ocena | suma spoza charakterystycznych: <10 FV, 10–50 U1, >50 U2 |
| Obce gatunki inwazyjne | lista + liczba + pokrycie + „nie stwierdzono” | 0 FV; 1 gat. ≤10% U1; ≥2 gat. albo 1 >10% U2 |
| Procent powierzchni zajęty przez siedlisko | % | >75 FV, 50–75 U1, <50 U2 |
| Występowanie śmiałka pogiętego | pokrycie % + „nie stwierdzono” | <10 FV, 10–25 U1, >25 U2 |
| **Zniszczenia mechaniczne** | select + % transektu + opis | select > liczba: 0 FV, ≤25 U1, >25 U2 |

## Rozjazdy metodyki (krótko)
- **Powierzchnia siedliska**: tab. 2 nie ma wiersza dla tego parametru. Formularz: stabilna FV, niewielki spadek albo
  fragmentacja U1, wyraźny spadek U2 – tak oceniano w sprawozdaniach (Babia Góra 2009–2011, Kasprowy Wierch 2 i
  Śnieżnik 2021 – U1).
- **Gatunki ekspansywne**: w 2009–2011 obniżał je śmiałek pogięty; w 2016 uznano to za zmianę pozorną (śmiałek i
  borówka czarna mają własne wskaźniki), w 2021 Babia Góra znowu U1 za śmiałka 20–30%. Formularz liczy jak tab. 2
  (wszystko spoza charakterystycznych) i ostrzega przy tych dwóch gatunkach.
- **Śmiałek pogięty**: tab. 2 – 10% to już U1; Kozi Wierch 2016 (ok. 10%) i Karkonosze 2021 („nie przekraczał 10%”)
  dostały FV. Formularz idzie za tab. 2.
- **Zniszczenia mechaniczne**: karta Kopa Kondracka daje FV, bo zniszczenia przy szlaku są poza transektem; Czerwony
  Grzbiet w takim samym układzie (szlak 10–15 m od transektu) dostawał U1 w 2009–2011, 2016 i 2021 – przewodnik sam
  zaleca brać pod uwagę otoczenie do 50 m. Śnieżnik 2021: ok. 15% transektu + wydeptane otoczenie → U2 (tab. 2: U2 od
  >25%). Formularz: wybór ma pierwszeństwo, przy rozjeździe z liczbą – ostrzeżenie.
- **Gatunki charakterystyczne**: Mały Śnieżny Kocioł (wyleżysko, 1 gatunek) – U1 zamiast U2 z tab. 2; formularz
  podpowiada U2, przy podtypie 6150-4 ostrzega i sugeruje ocenę ekspercką. Katalog liczy wykaz z przewodnika (48
  taksonów, 16 wyleżyskowych) plus gatunki dopisywane w sprawozdaniach (rozchodnik alpejski, przetacznik alpejski,
  wierzbownica drobnolistna, omieg kozłowiec, turzyca czarniawa, pięciornik złoty…). „Gdy nie dominują – obniżyć” –
  tylko ręcznie.
- **Obce gatunki inwazyjne**: w praktyce (i wg samego przewodnika) to gatunki synantropijne zawlekane przez turystów,
  także rodzime. Śnieżnik 2021: 4 gatunki ok. 1% → U2 – zgodnie z tab. 2. Luka w tab. 2 (jeden gatunek dokładnie 10%)
  → U1. Wskaźnik niekardynalny.
- **Kardynalne**: zniszczenia mechaniczne dopiero od metodyki 2012 – w 2009–2011 nie były kardynalne.

## Przykład – Kopa Kondracka (Tatry), 05.08.2011
Obserwatorzy zanonimizowani („Jan Kowalski” + trzy osoby). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak
w karcie (wszystko FV)**, podpowiedzi formularza przy każdym wskaźniku zgodne z ekspertem, bez ostrzeżeń: borówka 2%,
krzewy 2%, 9 gatunków charakterystycznych, brusznica <5%, obce – brak, 100% transektu, śmiałek 2%, zniszczenia – brak
(na transekcie). Udział FV 100%. Zgodne też ze sprawozdaniami: Kopa Kondracka FV w 2009–2011.

Niespójności wewnątrz karty (nie zmieniają wyniku): zdjęcie III ma borówkę brusznicę z ilościowością 3 (25–50%), a
wskaźnik ekspansywnych mówi „<5%”; zdjęcie II – śmiałek 2 (5–25%), wskaźnik „ok. 2%”. Ocena dotyczy całego transektu,
zdjęcia tylko 3 × 25 m² – formularz zostawia jak w karcie.

Inne przeniesienia: współrzędne ucięte – do minut; komórka „Powierzchnia siedliska” zawiera rozciętą etykietę wiersza
oceny ogólnej – pominięta; krzewy – tylko zwarcie łączne (2%); „<5%” → 5; gatunki z „(D)” w warstwie D, reszta w C
(także kosodrzewina w zdjęciu III); karta nie ma tabel oddziaływań i zagrożeń – puste; „Data wypełnienia: –” w uwagach.
