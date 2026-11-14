# Specyfikacja karty 6170 – Nawapienne murawy wysokogórskie (Seslerion tatrae) i wyleżyska śnieżne (Arabidion coeruleae)

Formularz karty obserwacji wg przewodnika GIOŚ (Kozak, Kozłowska 2012, cz. II, s. 299–320, tab. 1 i 2, przykładowa karta
Upłaziańska Kopa 2) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 (badania 2016) i 2020–2021
(badania 2021). Siedlisko niepriorytetowe, tylko region alpejski (Tatry, Pieniny z Małymi Pieninami, Babia Góra). Silnik
wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna regułą ogólną (bez `structureRule`) – tu
reguła ogólna jest dokładnie regułą tab. 2. Z `src/forest` tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `labelOf`, `byOption`, `gradeMap`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: pole **Podtyp** (6170-1 Tatry, 6170-2 wyleżyska na piargach – Tatry, 6170-3 Pieniny, 6170-4 Babia Góra) wybiera
progi pasmowe z tab. 2; bez podtypu formularz liczy progi tatrzańskie i o tym mówi. Pole **Typ płatów** (murawa / murawa
naskalna; puste = naskalna przy 6170-3) wybiera progi „Średniego pokrycia roślin zielnych”. Transekt ok. 100–200 × 10–15 m
albo stanowisko punktowe (pole opisowe, niewymagane). Zdjęcia: 3 × 25 m² (5 × 5 m; ostrzeżenie przy innej powierzchni),
Braun-Blanquet, warstwy A–D. Termin: czerwiec – ok. połowy sierpnia (ostrzeżenie poza oknem i po 20.08); cykl 3–6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ „brak danych” → XX) + powierzchnia + opis | z selecta |
| **Bogactwo gatunkowe** | liczba gat./25 m² + opis | >30 FV, 20–30 U1, <20 U2; opis słowny generowany |
| **Cenne składniki flory** | lista + liczba wprost + ocena ekspercka | Tatry >20 / 10–20 / <10; Pieniny i Babia Góra >15 / 5–15 / <5 |
| Erozja | select + % transektu z erozją nasiloną | select > %: 0 FV, ≤25 U1, >25 U2 |
| Gatunki ekspansywne | lista + pokrycie zielnych / krzewów wprost + „nie stwierdzono” + ocena | gorsza z dwóch: zielne 0 FV, ≤10 U1, >10 U2; krzewy ≤10 (sama kosodrzewina ≤20) FV, ≤50 U1, >50 U2 |
| **Gatunki nawapienne** | lista + liczba wprost + ocena ekspercka | >20 / 10–20 / <10; Babia Góra >10 / 5–10 / <5 |
| Gatunki synantropijne | lista z pokryciem + nasadzenia drzew % + „nie stwierdzono” | 0 FV; 1 gat. lub nasadzenia ≤20% U1; ≥2 gat., 1 gat. >10% lub nasadzenia >20% U2 |
| Gatunki typowe dla podłoża bezwapiennego | lista + liczba wprost + „nie stwierdzono” | <5 / 5–10 / >10; Babia Góra <10 / 10–20 / >20 |
| Pokrycie drzew i krzewów (w tym kosodrzewiny) | lista + łączne % + „znikome/brak” + „tylko kosodrzewina” | <10 (sama kosodrzewina <20) FV, ≤50 U1, >50 U2 |
| Procent powierzchni zajęty przez siedlisko | % | >75 FV, 50–75 U1, <50 U2 |
| Stan populacji gatunków nawapiennych | select (z wariantem babiogórskim w etykiecie) | z selecta |
| Stan populacji gatunków bezwapiennych | select + pokrycie % | select > %: <10 / 10–20 / >20; Babia Góra <20 / 20–40 / >40 |
| Struktura przestrzenna płatów siedliska | select | z selecta; ostrzega, gdy kłóci się z pokryciem krzewów |
| Ślady wspinaczki lub wydeptywania | select | z selecta |
| Średnie pokrycie roślin zielnych | % | >75 / 50–75 / <50; murawy naskalne >25 / 10–25 / <10 |

## Rozjazdy metodyki (krótko)
- **Pokrycie drzew i krzewów – waloryzacja zmieniona w 2012 r.** (sprawozdanie 2015–2018, pkt 9): FV było „<20”, jest
  „<10, jeśli obecna tylko kosodrzewina <20”. Formularz liczy wg wersji 2012 (tej z przewodnika).
- **Ocena ogólna wbrew regule w 2011 r.**: Żleb pod Czerwienicą (i Kominiarski Wierch 2) – struktura U1 przy FV
  pozostałych, ocena ogólna FV. Sprawozdanie 2015–2018 nazywa to „wystawione niezgodnie z regułą”; formularz liczy regułą.
- **Kopieniec 2016**: pokrycie drzew 45% oceniono na U2 (tab. 2: 10–50% = U1), w 2021 r. poprawiono na U1 „ze względu na
  stabilność”. Formularz: 45% → U1.
- **Średnie pokrycie roślin zielnych w Pieninach**: tab. 2 dla muraw naskalnych daje U2 poniżej 10%, a w 2021 r. „od kilku
  procent do około 40%” uznano za właściwe. Formularz podpowiada wg tab. 2; ocena eksperta zostaje, karta pokaże rozjazd.
- **Bogactwo gatunkowe – klasy słowne**: tab. 1 „wyjątkowo duże” >40, „duże” 30–40; tab. 2 – >35 i >30. Ocena bez zmian
  (FV od 31), opis słowny wg tab. 2 (jak w karcie: „Wyjątkowo duże, ok. 40”).
- **Gatunki ekspansywne – krzewinki**: tab. 2 zna tylko „rośliny zielne” i „krzewy”. Borówka czarna na ok. 50% Akademickiej
  Perci dostała w 2021 r. U1 – to próg krzewów (zielne dałyby U2), więc krzewinki liczą się z krzewami. Trzcinnik pstry
  w Pieninach to stały składnik muraw (sprawozdanie 2021) – przy 6170-3 pomijany.
- **Gatunki synantropijne**: luka między „znikomym pokryciem” (U1) a „>10%” (U2) dla jednego gatunku – do 10% liczone jako
  U1; nasadzenia dokładnie 20% – U1. W 2021 r. pokrzywę u podnóża skał pominięto (nie wchodzi na skały) – to zostaje ocenie
  eksperta. Karta 6170 nie ma wskaźnika obcych – winobluszcz i niecierpek (jedyne obce w monitoringu) liczą się tutaj.
- **Babia Góra**: progi pasmowe z tab. 2 (cenne, nawapienne, bezwapienne, stany populacji) – w 2011 r. „obniżono kryteria”,
  żeby nie dawać U2 za podłoże; w 2021 r. stanowiska babiogórskie i tak mają strukturę U1 (nawapienne 5–6 gat.).
- **Propozycje niewprowadzone** (2015–2018): usunąć „Cenne składniki flory”, uznać „Pokrycie drzew i krzewów” za kardynalny.
  W 2021 r. nadal 14 wskaźników, 3 kardynalne – formularz tak samo.
- **Granice przedziałów** (tab. 2 podaje je na zakładkę): 30 gat. → U1; cenne 20 (Tatry) / 15 → U1; nawapienne 20 / 10 → U1;
  bezwapienne 5 i 10 → U1; procent siedliska 75 i 50 → U1; pokrycie zielnych 75 / 25 → U1; erozja 25% → U1; krzewy 10 → U1
  (w „Ekspansywnych” 10 → FV, bo tam „do 10%”).

## Przykład – Upłaziańska Kopa 2 (Tatry, 6170-1), 03.08.2010
Obserwatorzy zanonimizowani („Jan Kowalski”, „Anna Nowak”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak
w karcie, podpowiedzi formularza zgodne z ekspertem przy każdym z 15 wskaźników (zero rozjazdów)**: powierzchnia FV,
bogactwo FV (ok. 40 gat./25 m²), cenne FV (51 gat., policzone z listy), erozja U1, ekspansywne FV (brak), nawapienne FV
(35 gat., z listy), synantropijne FV (brak – kosodrzewina reintrodukowana się nie liczy), bezwapienne U1 (6 gat.), krzewy
FV (znikome), siedlisko na transekcie FV (100%), populacje FV / FV, struktura przestrzenna FV, wydeptywanie FV, pokrycie
zielnych FV (ok. 80%) → struktura FV (dwa niekardynalne U1 nie obniżają), perspektywy FV, ogólna FV. Udział FV 95%, U1 5%.

Przeniesienia: współrzędne ucięte w przewodniku – do minut; obszary chronione rozdzielone na Natura 2000 i park narodowy;
warstwy w zdjęciach jak w karcie (Pinus mugo w B i C, siewki Picea abies w C, porosty w D); wartość powierzchni pusta
w karcie – formularz wpisuje etykietę klasy; kod oddziaływania 900 „Erozja” (lista 1999) → K01.01, intensywność B → M;
data wypełnienia „–” i rok – w uwagach.
