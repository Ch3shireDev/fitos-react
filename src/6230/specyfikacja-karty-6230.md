# Specyfikacja karty *6230 – Bogate florystycznie górskie i niżowe murawy bliźniczkowe (Nardetalia – płaty bogate florystycznie)

Formularz karty obserwacji wg przewodnika GIOŚ (Korzeniak 2010, rozdz. 6230, tab. 1 i 2, przykładowa karta Piorunowiec)
z modyfikacją metodyki z 17.07.2015 i praktyką oceny ze sprawozdań 2006–2008, 2013–2014, 2015–2018 i 2023–2025
(przy rozjazdach wygrywa nowsze). Siedlisko **priorytetowe** (`priority: true` → „*6230”), regiony alpejski i
kontynentalny. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian**; struktura i ocena ogólna liczone regułą
ogólną (bez `structureRule`) – tab. 2 6230 mówi to samo. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: podtyp (6230-1 bieszczadzkie/wschodniokarpackie, 6230-2 zachodniokarpackie, 6230-3 sudeckie, 6230-4
niżowe), nazwa, zbiorowiska (od nich zależy dziurawiec), transekt 10 × 200 m = 20 arów (ostrzeżenie, gdy powierzchnia ≠
2000 m²), wysokość, **piętro roślinności** (niż / pogórze / regiel / piętro subalpejskie – wymagane, zmienia progi
bogactwa). Zdjęcia: 3 × 25 m². Termin: 15.07–31.08 (poza tym ostrzeżenie).

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | stabilna FV, inne zmiany U1, wyraźny spadek/zanik U2, brak danych XX |
| **Gatunki charakterystyczne** | lista + liczba wprost | >6 FV, 4–6 U1, <4 U2 |
| Gatunki dominujące | lista z pokryciem + pokrycie bliźniczki | gorsza z: bliźniczka >50 FV (lub charakterystyczne razem >50%), 30–50 U1, <30 U2; gatunki spoza charakterystycznych >25%: 0 FV, 1–2 U1, >2 U2 |
| Bogactwo gatunkowe | liczba gatunków naczyniowych w 3 zdjęciach (albo średnia) | >25 FV, 10–25 U1, <10 U2; piętro subalpejskie: >13 FV, 7–13 U1, <7 U2 |
| Obce gatunki inwazyjne | lista + pokrycie + „nie stwierdzono” | brak FV, ≤10% U1, >10% U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + łączne pokrycie | <20 FV, 20–30 U1, >30 U2 |
| **Ekspansja krzewów i podrostu drzew** | lista + zwarcie warstwy B + wariant | szybko zarastające: <10 FV, 10–40 U1, >40 U2; sam jałowiec: <25 FV, 25–50 U1, >50 U2 |
| Eutrofizacja | select + gatunki nitrofilne | select ma pierwszeństwo; inaczej pokrycie nitrofilnych 0 FV, <10 U1, ≥10 U2 |
| **Struktura przestrzenna płatów siedliska** | zwarcie + wielkość płatów + fragmentacja | zwarte/małe stabilne FV, pośrednie U1, drobne/zanikające U2 |

## Rozjazdy metodyki (krótko)
- **Gatunki dominujące i bogactwo gatunkowe**: progi z modyfikacji 2015 (stare z przewodnika 2010 nie uwzględniały
  współpanowania ani pięter). Formularz liczy gorszą z dwóch ocen dominantów; Piorunowiec (bliźniczka 80%, borówka 30%)
  → U1, tak jak w karcie.
- **Dziurawiec czteroboczny** liczy się jako charakterystyczny tylko w Polygalo-Nardetum (sprawozdanie 2024) – zależnie
  od pola „Zbiorowiska”. Wrzos jest charakterystyczny i nie obniża oceny dominantów (2024 przyznaje, że wcześniejsze
  traktowanie go jako niepożądanego było błędem).
- **Krzewy**: łagodniejsze progi dla samego jałowca (gatunek wolno rosnący, element psiar niżowych). Wariant dobierany
  z listy gatunków albo ręcznie.
- **Gatunki ekspansywne**: tab. 2 przy 40% daje U2, karta Piorunowiec – U1. Formularz podpowiada U2 i ostrzega,
  ocena eksperta zostaje. Sprawozdania 2013–2014 i 2016–2018 dały Piorunowcowi strukturę U2.
- **Bogactwo gatunkowe**: kontekst formularza nie widzi zdjęć fitosocjologicznych, więc liczby gatunków w trzech zdjęciach
  wpisuje się we wskaźniku (albo samą średnią).
- **Sudety Środkowe** (suche murawy Violion caninae): mały udział bliźniczki jest tam naturalny – pomoc wskaźnika każe
  ocenić ekspercko, formularz nie zmienia progów.

## Przykład – Piorunowiec (Gorce), 17.08.2007
Koordynator zanonimizowany („Jan Kowalski”). Podtyp 6230-2, piętro reglowe. Oceny jak w karcie: powierzchnia FV;
charakterystyczne FV, dominujące U1, bogactwo U1 (17/18/13 → średnio 16), obce FV, ekspansywne U1, krzewy FV,
eutrofizacja FV, struktura przestrzenna U1 → struktura U1; perspektywy U1; ocena ogólna U1. Jedyne ostrzeżenie: ekspansywne
(borówka 30% + brusznica 10% = 40%, tab. 2 → U2). Udziały FV/U1/U2: 40/55/5.

Przeniesienia: współrzędne ucięte do minut (jeden punkt na początek, środek i koniec); literówki w nazwach (Dantonia,
schreberii, „Rumex cfr. acetosa”) poprawione; świerk w dwóch warstwach (B i C); stare kody działalności (250, 102,
501, 161) → F04, A03, D01.01, B01, intensywność C → L, stary kod w opisie; „Zagrożenia” (tekst) → A04.03 i K02.

## Testy
`habitats/methodology.test.ts` (37 – progi, podpowiedzi, przykład, eksport docx) i `Card6230.test.tsx` (4 – nagłówek
z gwiazdką, przykład, wiersze kardynalne, kafelek na stronie głównej). Całość repo: 110 plików, 1658 testów.
