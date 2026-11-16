# Specyfikacja karty 7150 – Obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion

Formularz karty obserwacji wg przewodnika GIOŚ (Koczur 2012, cz. III, s. 123–136, tab. 1 i 2, lista wskaźników
kardynalnych, przykładowa karta „Bór na Czerwonem”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania
2010–2011) i 2015–2018 (badania 2016). Siedlisko niepriorytetowe, region kontynentalny i alpejski. Silnik wspólny
(`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna regułą ogólną (bez `structureRule`). Karta
rejestruje się sama przez `meta.ts`.

Stanowisko: podtyp (7150-1/2/3 – propozycja ze sprawozdania 2009–2011, opcjonalny, nie wpływa na ocenę), typ stanowiska,
nazwa obszaru, zarządzający, transekt 10×200 m z dopuszczalnymi modyfikacjami, współrzędne początku, środka i końca,
wysokość jako zakres. Zdjęcia: 3 × 25 m², warstwy B–D, uwagi do zdjęcia. Termin: optymalnie lipiec–sierpień (przygiełki
kwitną od lipca); czerwiec, wrzesień, październik – ostrzeżenie miękkie; reszta – „poza sezonem”. Inne informacje:
zbiorowiska sąsiadujące, propozycje działań, istniejące plany, „Monitoring jest wymagany” + uzasadnienie, inne monitoringi,
udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | bez zmian lub wzrost FV, inne U1, wyraźny spadek U2 |
| Procent powierzchni zajęty przez siedlisko | % | 40–100 FV, 10–40 U1, <10 U2 (40 → FV, 10 → U1) |
| **Struktura przestrzenna płatów** | select + opis | >50 m² FV; 10–50 m² lub liczne 1–10 m² U1; pojedyncze 1–2 m² U2 |
| **Gatunki charakterystyczne** | lista z pokryciem + liczba + pokrycie + ocena | >3 gat. LUB >50% FV; 2–3 gat. LUB 20–50% U1; 1 gat. i <20% U2 |
| Gatunki dominujące | select + lista + opis | z selecta; ostrzega, gdy największe pokrycie ma gatunek niecharakterystyczny |
| **Odsłonięty torf** | % + opis | >50 FV, 10–50 U1, <10 U2 |
| Pokrycie i struktura mszaków | % + udział torfowców / mchów brunatnych / wątrobowców | <20 FV, 20–50 U1, >50 U2 |
| **Obce gatunki inwazyjne** | lista + łączne + „nie stwierdzono” | brak FV, do 5% U1 (bez pokrycia też U1), >5% U2 |
| **Gatunki ekspansywne roślin zielnych** | lista + łączne + „nie stwierdzono” + ocena | <1% (pojedyncze) FV, do 5% U1, >5% U2 |
| **Obecność krzewów i podrostu drzew** | lista + łączne + „nie stwierdzono” | <1% FV, do 10% U1, >10% U2 |
| Stopień uwodnienia | 5 punktów (cm poniżej; nad powierzchnią – minus) + ocena | średnia: −2…10 FV; −10…−2 lub 10…20 U1; reszta U2 |
| Pozyskanie torfu | select + opis | z selecta (tab. 2) |
| Melioracje odwadniające | select + opis | z selecta (tab. 2) |
| Geneza siedliska | select + opis | naturalne FV, nieregularne/zwierzęta U1, antropogeniczne U2 |

## Rozjazdy metodyki (krótko)
- **Ocena ogólna**: tab. 2 podaje „wszystkie FV lub dwa FV i jeden U1 → FV”. Sprawozdanie 2016 wprost: „ocena stanu
  ochrony jest tożsama z oceną najniżej ocenionego parametru” – formularz liczy regułą ogólną silnika (jak 3140, 4060,
  6130). Na przykładzie Bór na Czerwonem bez różnicy (U1/U1/FV → U1 obiema regułami).
- **Gatunki charakterystyczne – „lub”**: tab. 2 łączy liczbę gatunków i pokrycie spójnikiem „lub”; karta przykładowa
  (2 gatunki, 65%) daje FV, więc formularz bierze lepszy z warunków. Sprawozdanie 2016 opisuje FV jako „4 i więcej
  gatunki o łącznym pokryciu ponad 50%” – to opis wyników, nie zmiana progu.
- **Które gatunki liczyć**: katalog liczy 5 reprezentatywnych + 5 lokalnie charakterystycznych z tab. 1 i sit drobny /
  wąkrotę z pkt 4. Pkt 4 zastrzega lokalne (wełnianeczka, wełnianka wąskolistna, turzyca dzióbkowata) dla gór bez
  przygiełek; ekspert w karcie przykładowej nie policzył wełnianki wąskolistnej ani torfowca cieniutkiego ze zdjęć, a w 2016
  na tym samym stanowisku liczono wełniankę. Formularz liczy to, co wpiszesz – pomoc to opisuje.
- **Granice**: krzewy dokładnie 10% → U1 (Puścizna Rękowiańska 2016: kruszyna 10% → U1); „pojedyncze” = 0,5 → FV dla
  ekspansywnych i krzewów; obce bez pokrycia → U1 (praktyka 2010–2011 i 2016: pojedyncze osobniki U1).
- **Mszaki odwrotnie niż na torfowiskach wysokich**: dużo mchów = zły znak (2016: >60% torfowców → U2). Pomoc o tym ostrzega.
- **Uwodnienie**: za mokro też jest źle (>10 cm nad powierzchnią U2). Średnia z punktów; ostrzeżenie, gdy pojedynczy punkt
  wypada w U2, a średnia nie. Bez pomiaru – ocena ręczna („woda widoczna do podeszwy” → FV).
- **Wskaźniki krytykowane w sprawozdaniu 2016–2018** (geneza, odsłonięty torf, pozyskanie torfu, uwodnienie, struktura
  płatów, mszaki, powierzchnia – m.in. „pozyskanie torfu sprzyja przygiełkowiskom”): formularz zostaje przy tab. 2,
  postulaty są w pomocy przy wskaźnikach.
- **Identyfikacja siedliska**: sprawozdanie 2016–2018 proponuje wyłączenie 32 stanowisk (w tym Bór na Czerwonem → 7110)
  i zawężenie 7150 do kilku syntaksonów – opisane w pomocy do nazwy stanowiska i zbiorowisk.

## Przykład – Bór na Czerwonem (Torfowiska Orawsko-Nowotarskie), 28.06.2010
Ekspert zanonimizowany („Jan Kowalski”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak w karcie**
(powierzchnia U1, struktura U1, perspektywy FV, ogólna U1), podpowiedzi formularza przy każdym wskaźniku zgodne z
ekspertem: 20% siedliska na transekcie U1, płaty 3–50 m² U1, przygiełka 50% + rosiczka 15% FV, dominują gatunki
charakterystyczne FV, odsłonięty torf 40% U1, mszaki 35% U1, obcych i ekspansywnych brak FV, sosna 0,5% FV, woda
2 cm nad – 1 cm pod FV, torf wydobywany do ok. 1925 r. FV, rowy z XIX w. FV, rynny erozyjne FV. Udział FV/U1/U2 30/60/10.

Jedyne ostrzeżenie: termin 28.06 przed optymalnym oknem (lipiec–sierpień) – opisane w uwagach.

Inne przeniesienia: współrzędne ucięte – do minut, jedna para dla całego stanowiska; zdjęcie I 5×4 m = 20 m²;
nachylenie zdjęcia III „10–15°” i wysokości warstwy C „20/10”, „30/10 cm” w uwagach do zdjęć; uwodnienie – dwa skrajne
pomiary z zakresu; stare kody oddziaływań 853/950/720 → J02.05/K02/G05.01, intensywność B → M, C → L; tekst „Zagrożenia”
→ K02 i G05.01; rok, typ monitoringu, „Inne obserwacje” (rok wyjątkowo mokry) w uwagach.
