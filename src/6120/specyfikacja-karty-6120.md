# Specyfikacja karty *6120 – Ciepłolubne, śródlądowe murawy napiaskowe (Koelerion glaucae)

Formularz karty obserwacji wg przewodnika GIOŚ (Kujawa-Pawlaczyk 2010, cz. I, s. 106–118, tab. 1 i 2, przykładowa karta
Kalinik 2008) z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025. Siedlisko
priorytetowe (`priority: true` → kod `*6120`), nieleśne, region kontynentalny. Silnik wspólny (`src/7120`) i `src/forest`
– **bez zmian**; struktura liczona regułą ogólną (bez `structureRule`). Z `src/forest` tylko generyczne klocki
(`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`, `gradeMap`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 200 m (karta: 10×200 m; ostrzeżenie, gdy ani 200 m długości, ani 2000 m²). Zdjęcia: 3 × 25 m² co
100 m (początek, środek, koniec), Braun-Blanquet, warstwy B, C, D. Termin: połowa maja – koniec czerwca (ostrzeżenie poza
oknem). Powtarzanie co 3–5 lat. Liczba stanowisk wg powierzchni muraw (do 1 ha – 1, 1–3 ha – 2, >3 ha – 3) – w pomocy.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska na stanowisku (parametr) | select trendu (+ „brak danych” → XX) + ha + opis | z selecta |
| **Gatunki charakterystyczne** | lista z pokryciem + liczba wprost + „nie stwierdzono” | liczba > lista tab. 1: ≥5 FV, 2–4 U1, 0–1 U2 |
| **Obce gatunki inwazyjne** | lista z pokryciem + liczba + łączne pokrycie + „nie stwierdzono” | 0 FV; 1–2 gat. i ≤5% U1; >5% albo >2 gat. U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + liczba + forma (pojedynczo / w rozproszeniu / zwarte płaty) | 0 FV; 1 pojedynczo FV; 1–2 U1; >2 U2 |
| **Ekspansja krzewów i podrostu drzew** | pokrycie % + lista + opis | <10 FV, 10–25 U1, >25 U2 |
| **Struktura przestrzenna płatów muraw** | select + opis | z selecta |
| Zachowanie strefy ekotonowej | select + opis | z selecta |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Gatunki charakterystyczne**: tab. 2 ma zachodzące przedziały (FV „co najmniej 5”, U1 „co najmniej 2 do 5”) – 5 → FV.
  Liczy się tylko 22 gatunki z tab. 1 (synonimy raz: Koeleria cristata = macrantha, Bassia = Kochia laniflora, Alyssum
  desertorum = turkestanicum, Potentilla puberula = pusilla). Gatunki typowe z pkt 4 (zawciąg, pięciornik piaskowy,
  macierzanka piaskowa, rozchodnik ostry, kocanki…) są w katalogu jako „typowe – nie liczą się” i wywołują ostrzeżenie.
  Propozycja ze sprawozdania 2015–2018 (≥5 FV, 3–4 U1, 1–2 U2) nie weszła – 2024 liczono wg tab. 2; formularz pokazuje ją
  tylko w wyjaśnieniu.
- **Obce**: tab. 2 przy U2 ma „licznie, >5% (więcej niż dwa gatunki)” – formularz czyta to jako „>5% ALBO >2 gatunki”
  (2024: U1 = „1–2 gatunki i pokrycie ≤5%”). Granica 5% → U1. Archeofity i chwasty polne z tab. 3 sprawozdania 2024
  (stokłosa dachowa, włośnice, starzec wiosenny, mak, tasznik…) są oznaczone jako „bez tendencji do inwazji”: liczą się,
  ale z ostrzeżeniem (2024: „sporadyczny udział 3 jednorocznych gatunków… nie powinien obniżać oceny”). Żarnowiec – jako
  rodzimy krzew (2018: sporny).
- **Ekspansywne**: tab. 2 łączy liczbę gatunków z formą występowania. Rozstrzyga liczba; forma tylko przy jednym gatunku
  (pojedynczo → FV, inaczej albo bez formy → U1). 1–2 gatunki w zwartych płatach (tab. 2 tego nie przewiduje) → U1
  z ostrzeżeniem, bo w 2024 zwarty trzcinnik bywał oceniany na U2. >2 gatunki nie w płatach → U2 z ostrzeżeniem.
  Lista gatunków: tab. 1 (trzcinnik piaskowy) + praktyka 2018–2024 (perz, rajgras, mietlica pospolita, kłosówka, turzyca
  owłosiona, wrotycz, bylica, ostrożeń, jeżyna popielica, skrzyp polny).
- **Krzewy i podrost**: granice 10 i 25% → U1. Pomoc: liczy się pokrycie w obrębie siedliska (2018, Rygol).
- **Struktura przestrzenna**: dodana opcja „płaty małe i izolowane, bez mozaiki” → U2 (praktyka 2024).
- **Powierzchnia**: U1 w tab. 2 to „inne kombinacje” – select ma „inne kombinacje (np. niewielki ubytek)”.
- **Zestaw wskaźników**: tab. 2 i monitoring 2013–2024 – 6 wskaźników, nic wyłączonego. Karta z przewodnika jest z 2008 r.
  (metodyka sprzed publikacji 2010): ma wiersz „Gatunki dominujące” (usunięty w 2010), a nie ma „Struktury przestrzennej”.
  Zamiast przełącznika zestawów (jak w 5130) dominujące idą do uwag – nie mają progów w żadnym źródle.
- **Udział FV/U1/U2** (karta: przy ocenie ogólnej) – trzy liczby w „Innych informacjach”, jak w 2330 i 5130.
- **Kody oddziaływań**: słownik 2011 (sprawozdania 2013–2018). Sprawozdanie 2024 używa już nowej klasyfikacji (grupy
  A–X), bez kodów szczegółowych w tekście – nie przenoszono.

## Przykład – Kalinik, 6.08.2008
Ekspert zanonimizowany („Jan Kowalski”). **Wszystkie oceny wskaźników, parametrów i ocena ogólna jak w karcie**:
powierzchnia FV (2 ha), gatunki charakterystyczne FV, obce FV, ekspansywne FV, krzewy FV (podrost usunięty), ekoton FV,
perspektywy FV → struktura FV, ogólna FV. Udział FV 80%, U1 20%, U2 0 („–”).

**Rozjazdy z metodyką (nie z kartą)**:
1. **Gatunki charakterystyczne** – karta wymienia 4 gatunki i daje FV. Z listy tab. 1 są tylko 3 (strzęplica sina,
   kostrzewa piaskowa, rozchodnik sześciorzędowy; zawciąg jest w pkt 4, nie w tab. 1). Nawet z goździkiem kartuzkiem ze
   zdjęć wychodzi 4. Tab. 2 wymaga dla FV co najmniej 5 → podpowiedź **U1**. Ocena eksperta zostaje, formularz pokazuje
   „odbiega od progów (U1)”. **Na wynik wpływa**: to wskaźnik kardynalny – przy ocenie wg progów struktura i ocena ogólna
   byłyby U1, nie FV. Sprawozdanie 2006–2008 też daje Kalinikowi FV (wtedy jako „charakterystyczna kombinacja gatunków”).
2. **Struktura przestrzenna płatów muraw** (kardynalny) – w karcie brak wiersza. Przyjęto FV ze sprawozdania 2006–2008
   (Kalinik: wszystkie wskaźniki FV) i opisano w wartości wskaźnika.
3. **Termin** – 6 sierpnia, poza optymalnym oknem (połowa maja – czerwiec): formularz ostrzega.
4. **Gatunki dominujące** (pięciornik piaskowy 15%, macierzanka piaskowa 30% – FV) – do uwag.
5. Drobiazg: w zdjęciach są mietlica pospolita, turzyca owłosiona i skrzyp polny (w praktyce 2018–2024 – ekspansywne), a
   wskaźnik ekspansywnych ma „Brak”. Zostawione jak w karcie – wskaźnik ocenia się na transekcie, nie w zdjęciach.

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; literówki w nazwach poprawione (psammofila → psammophila,
Triforium → Trifolium, Gallium → Galium, cyparisias → cyparissias, Hypochoeris → Hypochaeris, „Armeria elongata subsp.
maritima” → Armeria maritima subsp. elongata; w wartości wskaźnika tekst jak w karcie). Perspektywy – w karcie sama ocena;
opis złożony z pól „Zagrożenia” i „Wykonywane działania”. Działalność: 165 Usuwanie podszytu → B02.03 (+, A → H),
950 Ewolucja biocenotyczna → K02 (−, A → H), stare kody w opisach; zagrożenie (tekst) → K02. Rok, typ monitoringu,
nazwa obszaru i „monitoring wymagany – tak, referencyjne” – w uwagach.

Po drodze: w 2018 r. na Kaliniku nie znaleziono już żadnego gatunku charakterystycznego (U2), a w 2024 siedlisko zanikło
(przejście w zarośla) – przykład z przewodnika to stan sprzed 16 lat.
