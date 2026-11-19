# Specyfikacja karty *7220 – Źródliska wapienne ze zbiorowiskami Cratoneurion commutati

Formularz karty obserwacji wg przewodnika GIOŚ (Parusel 2010, cz. I, s. 174–188, tab. 1 i 2, lista wskaźników
kardynalnych, karta przykładowa „Las Grabicz 1”) z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014,
2015–2018 (badania 2016–2017) i 2023–2025 (badania 2024). Przy rozjazdach podpowiedź idzie za tab. 2, praktyka trafia
do pomocy i ostrzeżeń. Siedlisko **priorytetowe**, region kontynentalny i alpejski.
Karta rejestruje się sama przez `meta.ts`; `App.tsx`, strona główna, `cards.ts`, silnik `src/7120` i `src/forest` – **bez zmian**.

Wspólne z 7120: GUID, obszary chronione, wymiary transektu, wykonawca, pola zdjęć fitosocjologicznych (warstwy A–D),
„Inne informacje” – przez `pickField`.

Stanowisko: podtyp (7220-1 typowy, 7220-2 ubogi z zachodzącą depozycją CaCO₃, 7220-3 ubogi z kopalną martwicą), wariant
(/g górski, /w wyżynny, /n niżowy), **wariant listy gatunków** (przewodnik / rozszerzona), typ stanowiska, nazwa obszaru,
zbiorowiska, opis, powierzchnia (m²), zarządzający, metoda (punktowa – płat do 5 m, minitransekt – pas 2 m wzdłuż cieku,
kartowanie), współrzędne początku i końca, transekt (opcjonalnie), wysokość. Termin: 1.05–31.08 bez ostrzeżenia,
kwiecień i wrzesień – ostrzeżenie miękkie, poza 1.04–30.09 – twarde. Zdjęcia: domyślnie 3, powierzchnia bez domyślnej
(od kilkuset cm² dla mszaków do 25 m²). Oddziaływania: 29 kodów (m.in. J02.07, B02.04, K04.05, L05, H01, G01.04, X).

## Wskaźniki (pogrubione = kardynalne)
Tab. 2 podaje dla wielu klas jednocześnie liczbę gatunków i pokrycie – formularz liczy obie i bierze **gorszą** ocenę
(`worse7220`).

| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + opis | z selecta |
| **Gatunki charakterystyczne** | lista z pokryciem | ≥3 gat. i ≥25% FV; 1–2 gat. albo <25% U1; brak U2 |
| Gatunki dominujące (spoza charakterystycznych) | lista z pokryciem | ≤1 gat. i <25% FV; 2–3 albo ≤50% U1; >3 albo >50% U2 |
| Gatunki ekspansywne | lista + „nie stwierdzono” | ≤1 gat. i <10% FV; 2–3 albo ≤50% U1; >3 albo >50% U2 |
| Obce gatunki inwazyjne | lista + „nie stwierdzono” | brak FV; 1 gat. i <5% U1; ≥2 albo ≥5% U2 |
| Gatunki wskazujące na eutrofizację | lista + „nie stwierdzono” | brak FV; 1 gat. i ≤10% U1; ≥2 albo >10% U2 |
| Pokrycie wątrobowców | % | >10 FV, ≤10 U1, 0 U2 |
| **Proces wytrącania martwicy** | select (intensywny / śladowy / brak / XX) + podłoże + przewodność | z selecta |
| **Występowanie martwicy wapiennej** | % pokrycia, liczne/nieliczne/brak, typ, kopalna | >5% FV, >0 U1, 0 U2; bez pomiaru: liczne FV, nieliczne U1, brak U2 |
| **Uwodnienie** | select + 5 głębokości wody + opis | z selecta (właściwe / słabe / niewłaściwe) |
| **Erozja wsteczna** | % | ≤5 FV, ≤20 U1, >20 U2 |
| **Erozja zboczowa** | % | jw. |
| **Erozja wgłębna (dna)** | % | jw. |
| **Erozja chemiczna** | % (+ XX) | jw. |

## Reguły ocen
- **Struktura – reguła silnika z jednym wyjątkiem** (`structureRule7220`): XX w erozji chemicznej nie blokuje oceny
  (pomijany). Tak robią sprawozdania – erozja chemiczna to XX na 75–95% stanowisk, a parametr i tak oceniano.
- **Ocena ogólna – silnik** („najgorszy decyduje”), zgodnie z tab. 2.
- Wiersz listy bez pokrycia liczy się jako 0,5% („+”).

## Rozjazdy metodyki i decyzje interpretacyjne
- **Lista gatunków charakterystycznych**: domyślnie lista przewodnika (Palustriella commutata, Cratoneuron filicinum,
  Philonotis calcarea, Arabis soyeri subsp. subcoriacea, Heliosperma quadridentatum, Saxifraga aizoides, Swertia perennis
  subsp. alpestris, Cochlearia polonica, Preissia quadrata, Pellia endiviifolia, Cardamine amara, Cratoneuron decipiens,
  Epilobium alsinifolium, Aneura pinguis) + gatunki klasy Montio-Cardaminetea (śledziennice, gwiazdnica bagienna, zdrojek,
  Philonotis fontana, rzeżucha Opiza). Wariant „rozszerzona” dokłada propozycję z 2018 r. stosowaną w 2024 r.
  (Bryum pseudotriquetrum, Brachythecium rivulare, Conocephalum, Rhizomnium, świerząbek orzęsiony, wierzbownica
  drobnolistna, fiołek dwukwiatowy, Eucladium verticillatum). Przy domyślnej liście te gatunki dają ostrzeżenie.
- **Progi 2018 nieprzyjęte**: postulowane połączenie erozji w jeden wskaźnik, rezygnacja z wątrobowców i eutrofizacji,
  łagodniejsze progi charakterystycznych (≥1 gat. i ≥5%), uwodnienie bez progów – tylko w pomocy, podpowiedzi idą za tab. 2.
- **Praktyka 2024**: jeden gatunek charakterystyczny o pokryciu 30–75% oceniany FV (tab. 2 daje U1) – ostrzeżenie,
  nie zmiana progu.
- **Martwica bez pomiaru**: tab. 2 podaje procenty, karty i sprawozdania – „liczne/nieliczne”; mapowanie liczne → FV,
  nieliczne → U1, brak → U2. Podtyp 7220-3 (kopalna martwica) i 7220-2 – ostrzeżenia, gdy proces/martwica nie pasują do podtypu.
- **Uwodnienie**: ocena z selecta; głębokości informacyjnie, ostrzeżenie gdy wszystkie <0,5 cm.
- **Dominanty/ekspansywne/eutroficzne**: gatunek wpisany do niewłaściwej grupy (np. charakterystyczny w ekspansywnych) –
  ostrzeżenie, liczy się tam, gdzie wpisany.

## Przykład „Las Grabicz 1” (Cieszyńskie Źródła Tufowe, 15.09.2007)
Oceny wskaźników jak w karcie. Trzy rozjazdy z tab. 2 (formularz pokazuje „odbiega od progów”): dominanty (5 gat., 75% →
U2), ekspansywne (2 gat., 20% → U1), eutrofizacja (2 gat. → U2). Gatunki charakterystyczne U1 (kardynalny) → **struktura
U1, ocena ogólna U1**; karta wpisuje FV/FV, co przeczy jej własnej tab. 2 – opisane w uwagach przykładu. Stare kody
oddziaływań (160, 501, 502) przepisane na słownik 2011 (B02, D01.01, D01.02).
