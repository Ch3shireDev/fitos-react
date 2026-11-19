# Specyfikacja karty 7210 – Torfowiska nakredowe (Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis)

Formularz karty obserwacji wg przewodnika GIOŚ (Buczek 2010, cz. I, s. 161–173, tab. 1 i 2, lista wskaźników
kardynalnych, karta przykładowa „Rezerwat Bagno Serebryskie 2”) z praktyką oceny ze sprawozdań z monitoringu 2006–2008,
2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024). Przy rozjazdach podpowiedź idzie za tab. 2, a praktyka
trafia do pomocy i ostrzeżeń; gdy tab. 2 sama sobie przeczy – tab. 1 i poprawka ze sprawozdania 2016–2018.
Siedlisko niepriorytetowe, tylko region kontynentalny. Karta rejestruje się sama przez `meta.ts`; `App.tsx`, strona
główna, silnik `src/7120` i `src/forest` – **bez zmian**.

Wspólne z 7120 (przez `pickField`): GUID, obszary chronione, transekt, wykonawca, pola zdjęć (warstwy A–D, gatunki),
„Inne informacje”.

Stanowisko: nazwa, typ, obszar, zbiorowiska, **zespół na transekcie (do progów)** – Cladietum marisci / Caricetum
buxbaumii / Schoenetum nigricantis / Schoenetum ferruginei; bez wyboru – Cladietum (z dopiskiem w objaśnieniu). Termin:
15.07–31.08 bez ostrzeżenia, 1.07–14.07 i 1–30.09 – miękkie (tak badano w 2018 i 2024 r.), poza lipcem – wrześniem –
twarde. Zdjęcie: 100 m² (jak w karcie), dodatkowe pole „Poziom wody w miejscu zdjęcia”.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | stabilna/rośnie FV, inne U1, wyraźny spadek U2 |
| Udział procentowy siedliska na transekcie | % + ocena | ≥70 FV, 40–70 U1, <40 U2 |
| **Gatunki charakterystyczne** | lista z pokryciem, łączne, „nie stwierdzono”, ocena | ≥40% (kłoć) / ≥30% (pozostałe) FV, ≥1% U1, <1% U2; sama marzyca w Schoenetum → U1 (interpretacja) |
| Gatunki dominujące | lista z pokryciem + ocena | udział siedliskotwórczych w pokryciu dominantów ≥60 FV, 40–60 U1, <40 U2 (interpretacja) |
| Obce gatunki inwazyjne | lista + łączne + „nie stwierdzono” | brak FV, ≤5% (i bez pokrycia) U1, >5% U2 |
| **Rodzime gatunki ekspansywne** | lista + „nie stwierdzono” + ocena | każdy gatunek osobno, najgorszy decyduje: trzęślica ≤5/≤15, trzcina i turzyce sztywna, nitkowata ≤20/≤30 |
| Gatunki synantropijne | lista + łączne + „nie stwierdzono” | brak FV, ≤5% U1, >5% U2 |
| **Zwarcie szuwarów** | % + ocena | kłoć ≥40 FV, pozostałe ≥30 FV; ≥20 U1; <20 U2 |
| **Ekspansja krzewów i podrostu drzew** | lista + łączne + „nie stwierdzono” | <5% FV, ≤10% U1, >10% U2 |
| **Stopień uwodnienia** | 5 pomiarów (+ nad, − pod) + ocena | kłoć 0…+20, pozostałe 0…+10 FV; do −20 i do +30 U1; dalej U2 (średnia) |
| Zanieczyszczenie pestycydami lub przenawożenie | select | brak FV, objawy/niewiadome XX (poza tab. 2) |
| Mechaniczne zniszczenie | % + pochodzenie | ≤5 FV, ≤10 U1, >10 U2 |

## Reguły ocen
- **Struktura i ocena ogólna – silnik.** Tab. 2 7210 mówi dokładnie to samo co reguła ogólna (kardynalne FV i pozostałe ≥U1
  → FV; kardynalne ≥U1 → U1; kardynalny U2 → U2; ogólna: wszystkie FV → FV, U1 bez U2 → U1, U2 → U2). Brak `structureRule`.

## Rozjazdy metodyki (krótko)
- **Gatunki charakterystyczne i dominujące**: tab. 2 bez liczb – progi to interpretacja (dla charakterystycznych powiązana
  z progiem FV zwarcia). Marzyca ruda liczy się jak marzyca czarniawa (tab. 1, praktyka 2013–2024). Mchy Scorpidium
  i Limprichtia (raport 2013–2014) nie liczą się – w opisie.
- **Trzcina**: tab. 2 „U1 – 20%, U2 – powyżej 20%” (U1 bez przedziału) – formularz bierze 20–30% U1 z tab. 1 i ostrzega.
- **Obce**: tab. 1 ostrzejsza („więcej niż pojedyncze pędy – U2”) – formularz idzie za tab. 2 (do 5% U1).
- **Zwarcie**: opis wskaźnika w karcie z przewodnika ma inne progi (kłoć 70/50%) – sprzeczne z tab. 2 i samą kartą.
  Postulat z 2018 r. (usunąć z kardynalnych) – tylko w pomocy.
- **Krzewy**: 1–5% to luka między „pojedynczymi” a 5% – FV z ostrzeżeniem (tab. 1: pojedyncze nie obniżają oceny).
- **Uwodnienie**: zapis w karcie z przewodnika przeczy tab. 2 (sprawozdanie 2016–2018: „błędny zapis”). Formularz używa
  progów z tab. 2 = poprawki z 2018 r.; dla pozostałych zespołów +10…+20 cm (luka) → U1. Puszcza Drawska (woda >30 cm uznana
  za FV) – ocena ekspercka. Znak odwrotny niż w kartach 7110/7120/7140 (tu woda nad torfem to norma) – pola nazywają się
  `level1–5`, nie `depth1–5`.
- **Mechaniczne**: tab. 2 sam procent, tab. 1 dodaje pochodzenie – antropogeniczne do 5% ostrzega.
- **Zanieczyszczenie**: wskaźnik spoza tab. 2 (w karcie z przewodnika i sprawozdaniach) – niekardynalny, XX nie psuje struktury.

## Przykład – Rezerwat Bagno Serebryskie 2 (Torfowiska Chełmskie), 2.08.2007
Koordynator zanonimizowany („Jan Kowalski”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak w karcie**:
powierzchnia XX, uwodnienie U1, reszta wskaźników FV, struktura U1, perspektywy U1, ogólna U1 (100% U1). Podpowiedź
formularza przy każdym wskaźniku zgodna z ekspertem, zero ostrzeżeń. Jedno zdjęcie (w karcie tylko jedno), literówki
nazw mszaków poprawione, stare kody oddziaływań przeniesione na słownik 2011 (A/B/C → H/M/L), „Zagrożenia” z raportu
rocznego → J02.15 i J01.01.
