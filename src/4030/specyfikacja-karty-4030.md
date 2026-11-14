# Specyfikacja karty 4030 – Suche wrzosowiska (Calluno-Genistion, Pohlio-Callunion, Calluno-Arctostaphylion)

Formularz karty obserwacji wg przewodnika GIOŚ (Pawlaczyk 2012, cz. II, s. 230–246, tab. 1 i 2, przykładowa karta
Duchny Młode I) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2020–2021 (2021 nadal oceniano
„wg Pawlaczyk 2012”). Siedlisko nieleśne, niepriorytetowe, tylko region kontynentalny. Silnik wspólny (`src/7120`) –
**bez zmian** (`structureRule` niepotrzebne – tab. 2 to reguła ogólna). Z `src/forest` tylko generyczne klocki.
Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 200×10 m; inny kształt dopuszczalny, byle 2000 m² (ostrzeżenie). Nowe pole **Typ wrzosowiska**
(knotnikowe / janowcowe / mącznicowe / kwietne / wilgotna postać) – decyduje, czy mącznica wlicza się do pokrycia wrzosu.
Zdjęcia: 3 × 100 m², Braun-Blanquet, warstwy B, C, D. Termin: lipiec–wrzesień (ostrzeżenie poza oknem). Powtarzanie
co 3 lata, najrzadziej co 5–6.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select (+ „brak danych” → XX) + ha + opis | z selecta |
| **Pokrycie wrzosu (ewentualnie łączne z mącznicą)** | % wrzosu + % mącznicy + opis | >50 FV, 30–50 U1, <30 U2 |
| Pokrycie traw | lista traw z pokryciem + łącznie wprost + opis | <10 FV, 10–30 U1, >30 U2 |
| **Zarośnięcie przez drzewa** | lista drzew z pokryciem + łącznie wprost + opis | <10 FV, 10–30 U1, >30 U2 |
| **Gatunki obce geograficznie** | lista z pokryciem + łącznie + „nie stwierdzono” | brak FV, pojedyncze ≤10% U1, >10% U2 |
| Ekspansywne gatunki rodzime (apofity) | jak wyżej | jak wyżej |
| Struktura populacji kluczowych gatunków | select + opis | z selecta |
| Stan kluczowych gatunków lokalnie typowych (fakultatywny) | select z „brak danych” (XX) + opis | z selecta |
| Inne zniekształcenia | select (niewymagany) + opis | z selecta |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Granice przedziałów**: wrzos 50% i 30% → U1 (FV dopiero >50%); trawy i drzewa 10% i 30% → U1; obce/apofity 10% → U1
  (U2 dopiero >10%). Tab. 2 ma przedziały domknięte z obu stron („30–50%”, „10–30%”), więc granice idą do środka.
- **Trawy – „zaokrąglenie do pełnych dziesiątek”** (tab. 1): formularz porównuje z progami sumę **bez** zaokrąglania.
  Z zaokrągleniem przykład z przewodnika (5 + 0,5 + 2–3 ≈ 8%) dałby 10% → U1, a karta ocenia FV. Trawy = wszystkie
  Poaceae, łącznie z trzcinnikiem i trzęślicą (w karcie trzcinnik jest w trawach); te same gatunki liczą się osobno w apofitach.
- **Mącznica**: metodyka – „ewentualnie na wrzosowiskach mącznicowych łączne”. Doliczana tylko przy typie „mącznicowe”;
  na innych typach pokazywana w opisie i w wyjaśnieniu („liczy się sam wrzos”). Typ pusty = sam wrzos.
- **Drzewa**: liczą się naloty i nasadzenia, także drzewa obce (czeremcha, dąb czerwony, robinia – idą też do obcych).
  Krzewy (jałowiec, kruszyna, żarnowiec, janowce) nie są drzewami – ostrzeżenie, gdy są na liście.
- **Obce i apofity – „pojedyncze”**: każdy wpisany gatunek bez pokrycia = „pojedyncze” → U1. Gatunek obecny, ale
  nieekspansywny (jak trzcinnik w karcie) nie idzie na listę apofitów – „Nie stwierdzono” + opis.
  Apofity z tab. 1 (trzcinnik, jeżyny, ciemiężyk) + ze sprawozdania 2021 (orlica, trzęślica, żarnowiec, wrotycz, perz).
- **Propozycje ze sprawozdania 2016–2018** (pojedyncze obce = FV, rezygnacja ze struktury populacji i wskaźnika
  fakultatywnego, „mało znaczące” zniekształcenia = FV) **nie weszły** do metodyki – 2021 oceniano wg tab. 2. Formularz
  trzyma się tab. 2, propozycje opisane w pomocy wskaźników.
- **Inne zniekształcenia**: select niewymagany – można zostawić pusty i wybrać ocenę ręcznie (XX), jak w przykładzie.
- **Udział powierzchni FV/U1/U2 na stanowisku**: silnik nie ma takiego pola – trzy liczby w „Innych informacjach”.
- **Kody oddziaływań**: słownik 2011 (jak w sprawozdaniach). Karta z przewodnika ma stare kody 2010.

## Przykład Duchny Młode I – zgodność z oryginałem
Czerwony Bór (PLH200018), 26.08.2011, koordynator zanonimizowany („Jan Kowalski”). **Wszystkie oceny jak w karcie**:
powierzchnia U1, wrzos FV (75–80% → 75; mącznica 2% niewliczana – typ janowcowy), trawy FV (8%), drzewa FV (5%), obce FV,
apofity FV, populacja FV, gatunki lokalne XX → struktura FV, perspektywy U1, ogólna U1; udział FV –, U1 100%, U2 –.

Rozbieżności z oryginałem (żadna nie zmienia ocen):
- **Brak wiersza „Inne zniekształcenia”** w karcie z przewodnika, choć tab. 1 i 2 go mają. W przykładzie: ocena XX
  z opisem „Brak w karcie z przewodnika – wskaźnika nie oceniono”. XX wskaźnika niekardynalnego nie rusza struktury.
- **Zdjęcia po 25 m²**, a metodyka mówi 100 m² – przepisane jak w karcie, odstępstwo w uwagach. „Arctostaphyllos”
  poprawione na Arctostaphylos (katalog zna obie pisownie).
- Współrzędne ucięte w przewodniku – do minut. Wysokość min./maks. → „138–141”.
- Kody: 100 Uprawa → A01, 161 Zalesianie → B01, 950 → K02; intensywność A/B → H/M; stary kod w opisie.
- Pola karty bez odpowiednika w silniku (typ stanowiska, zarządca, typ monitoringu, zagrożenia opisowe, uzasadnienie
  monitoringu, uwagi) – w „Uwagach”; działania ochronne wykonane i proponowane – w „Działaniach ochronnych”.
