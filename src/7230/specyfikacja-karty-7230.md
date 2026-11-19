# Specyfikacja karty 7230 – Górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk

Formularz karty obserwacji wg przewodnika GIOŚ (Koczur 2012, cz. III, s. 137–151, tab. 1 i 2, lista wskaźników
kardynalnych, karta przykładowa „Za Stronią”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania 2009),
2015–2018 (badania 2017) i 2023–2025 (badania 2024–2025). Przy rozjazdach podpowiedź idzie za tab. 2, a praktyka trafia
do pomocy i ostrzeżeń. Siedlisko niepriorytetowe; podtypy: 7230-1 Młaki górskie, 7230-2 Torfowiska zasadowe Polski
południowej (z wyłączeniem gór) i środkowej, 7230-3 Torfowiska źródliskowe i przepływowe Polski północnej.
Karta rejestruje się sama przez `meta.ts`; `App.tsx`, strona główna, silnik `src/7120` i `src/forest` – **bez zmian**.

Wspólne z 7120: pola stanowiska (GUID, obszary chronione, wymiary transektu, wykonawca), pola zdjęć fitosocjologicznych
(warstwy A–D), pięć pól głębokości wody, sposób pozyskania torfu i „Inne informacje” – przez `pickField`.

Stanowisko: podtyp (opcjonalny), typ stanowiska, nazwa obszaru, zarządzający, transekt 10×200 m (dozwolone modyfikacje:
krótszy i szerszy, mniejszy, trzy izolowane płaty), współrzędne początku, środka i końca, wysokość jako liczba albo zakres.
Termin: 15.06–15.08 bez ostrzeżenia, 1–14.06 i 16.08–30.09 – ostrzeżenie miękkie, poza czerwcem – wrześniem – twarde.
Inne informacje: propozycje działań, „Monitoring jest wymagany” + uzasadnienie, udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2, stan po 2012 r.)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | stabilna/rośnie FV, powolny ubytek albo mała względem potencjalnej U1, wyraźny spadek U2 |
| Procent powierzchni zajęty przez siedlisko | % + ocena (z XX) | ≥80 FV, 50–80 U1, <50 U2 |
| **Gatunki charakterystyczne** | lista z pokryciem, liczba i pokrycie wprost, ocena | >8 gat. albo pokrycie >50% FV; 1–3 i <20% U2; reszta U1 |
| Gatunki dominujące | lista z pokryciem + ocena | charakterystyczne ≥60% pokrycia dominantów FV; ≥40% (także z pokryciem ze wskaźnika charakterystycznych) U1; mniej U2 (interpretacja) |
| **Pokrycie i struktura gatunkowa mchów** | pokrycie mchów, % mchów brunatnych, % torfowców | gorsza z dwóch: mchy >50 / 20–50 / <20; brunatne >70 / 20–70 / ≤20 |
| Obce gatunki inwazyjne | lista + łączne + „nie stwierdzono” | brak FV, ≤5% (i bez pokrycia) U1, >5% U2 |
| **Gatunki ekspansywne roślin zielnych** | lista + łączne + „nie stwierdzono” + ocena | <1% FV, ≤5% U1, >5% U2; towarzyszące (skrzyp błotny itp.) pominięte z ostrzeżeniem |
| **Zakres pH** | 5 pomiarów albo min–max + ocena (z XX) | średnia (albo środek zakresu) >7 FV, 6–7 U1, <6 U2 |
| **Ekspansja krzewów i podrostu drzew** | lista + łączne + „nie stwierdzono” + ocena | <1% FV, ≤15% U1, >15% U2 |
| **Stopień uwodnienia** | 5 pomiarów, piezometr, obserwacja | −2…10 cm FV; −10…−2 i 10…20 U1; dalej U2; piezometr > średnia > obserwacja |
| Pozyskanie torfu | select (6 klas) + sposób + % zniszczonej powierzchni | z selecta |
| Melioracje odwadniające | select (5 klas) + opis | z selecta |

## Reguły ocen
- Ocena wskaźnika: wybór eksperta (tam, gdzie jest pole „Ocena”) ma pierwszeństwo; rozjazd z progami → ostrzeżenie.
- Specyficzna struktura i funkcje: tab. 2 nie podaje reguły – formularz bierze regułę ogólną silnika (kardynalny U2 → U2,
  kardynalny XX → XX, wszystko FV → FV, reszta U1). Brak `structureRule`.
- Ocena ogólna: reguła silnika („najgorszy decyduje”). Wiersz tab. 2 „dwa FV i jeden U1 → FV” to reguła sprzed erraty –
  jak w 3140, 4060, 6130, 7140.

## Rozjazdy metodyki (krótko)
- **Lista kardynalnych zmieniła się w 2012 r.** (sprawozdanie 2016–2018): dominujące i melioracje przestały być
  kardynalne, doszły gatunki charakterystyczne, mchy, pH i uwodnienie; martwica wapienna wypadła; górna granica U1
  mchów brunatnych z 65 na 70%. Formularz idzie za wersją 2012.
- **Dominujące**: tab. 2 opisuje klasy słowami („mniej więcej równy”) – progi 60/40% to interpretacja. Karta z
  przewodnika (skrzyp błotny 25% przy charakterystycznych ok. 42%) wychodzi U1 jak u eksperta.
- **Mchy**: kolumny tab. 2 łączą dwa warunki bez „i/lub” – bierzemy gorszą ocenę. 2024: dobrze ocenione stanowiska miały
  też torfowce alkalifilne – ostrzeżenie zamiast automatycznego U2.
- **pH**: sprawozdanie 2016–2018 postuluje rezygnację (Hala Cebulowa U2 tylko przez pH), eksperci dawali FV przy 6,4
  (Kobyla Biel) i 6,8 (Gieret); 2024 – liczne XX. Stąd pole oceny eksperckiej z XX.
- **Krzewy i ekspansywne**: postulat 2018 – krzewy FV ≤5 / U1 5–20 / U2 >20, ekspansywne FV ≤5 / U1 5–15 / U2 >15.
  Formularz trzyma tab. 2, postulat jest w pomocy. Luka „mniej niż 15%” / „ponad 15%” – 15% liczone do U1.
- **Krzewy w karcie z przewodnika**: kalina 1% + świerk 1% = 2% to wg tab. 2 U1, ekspert dał FV („pojedyncze”). Przykład
  zachowuje FV jako ocenę ekspercką – formularz ostrzega.
- **Procent powierzchni w górach**: postulat 2018 – trzy izolowane młaki zamiast transektu i XX (Raszów). Pole oceny z XX.
- **Trzcina nie jest gatunkiem obcym** (Bory Wylewisko 2017) – formularz ostrzega, gdy rodzimy gatunek trafi do obcych.
- **Bobrek**: w 2017 r. nie liczony w Wetlinie (gatunek kwaśniejszych torfowisk), w 2024 r. liczony. Katalog go liczy
  (klasa Scheuchzerio-Caricetea), z ostrzeżeniem, gdy gatunki młak kwaśnych dają ponad połowę pokrycia.
- **Uwodnienie**: tab. 2 podaje progi dla piezometru; Huściawa (2017) oceniona wg najgorszego punktu – formularz liczy
  średnią i ostrzega, gdy najgorszy punkt daje gorszą klasę.
- **Za Stronią w sprawozdaniu 2009–2011** ma strukturę FV, w karcie z przewodnika – U1. Przykład idzie za kartą.

## Przykład – Za Stronią (Pieniny), 15.07.2009
Podtyp 7230-1, stanowisko badawcze, Valeriano-Caricetum flavae, 1,44 ha, transekt 0,2 ha, 640–670 m n.p.m.
Ekspert zanonimizowany (Jan Kowalski). Oceny jak w karcie: powierzchnia FV; procent powierzchni 100% FV; gatunki
charakterystyczne 10 gat. FV; dominujące (skrzyp błotny 25%) U1; mchy 70%, wyłącznie brunatne FV; obce brak FV;
ekspansywne (sadziec 5%) U1; pH 7,2–7,6 FV; krzewy FV (ekspercka); uwodnienie, torf, melioracje FV. Struktura U1,
perspektywy U1, ocena ogólna U1, udział FV 90 / U1 10 / U2 0. Podpowiedzi formularza zgodne z ekspertem przy każdym
wskaźniku; jedyne ostrzeżenie – krzewy. Oddziaływanie: stary kod 140 Wypas (A) → A04, H, wpływ 0. Zagrożenia
„Zaniechanie użytkowania, sukcesja wtórna” → A03.03 + K02.01. Trzy zdjęcia (49, 39, 30 gatunków), siewki świerka i
leszczyny w warstwie C, „Euphrasia sp.” i „Polygala sp.” do rodzaju.
