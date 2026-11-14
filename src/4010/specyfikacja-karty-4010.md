# Specyfikacja karty 4010 – Wilgotne wrzosowiska z wrzoścem bagiennym *Erica tetralix*

Formularz karty obserwacji wg przewodnika GIOŚ (Pawlaczyk 2012, cz. II, s. 218–229, tab. 1 i 2) z praktyką oceny ze
sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021. Siedlisko nieleśne, niepriorytetowe, bardzo rzadkie
(w 2021 r. 10 stanowisk, w tym jedno bez siedliska). Silnik wspólny (`src/7120`) – **bez zmian**, także bez
`structureRule`: tab. 2 opisuje dokładnie ogólną regułę silnika. Z `src/forest` brane są tylko generyczne klocki
(`selectInput`, `speciesInput`, `pickField`, `listCover`, `labelOf`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 2000 m² (optymalnie 200×10 m, wymiary można zmienić przy zachowaniu powierzchni), 3 zdjęcia
fitosocjologiczne po 100 m², Braun-Blanquet, warstwy B/C/D. Powierzchnia płatów w **ha**. Termin: lipiec – wrzesień
(ostrzeżenie poza). Kontrola co 5–6 lat, optymalnie co 3 lata. Udział powierzchni FV/U1/U2 – dla **całego stanowiska**
(tak mówi karta), w „Innych informacjach”.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu i fragmentacji (+ „brak danych” → XX) + ha + opis | z selecta |
| **Pokrycie wrzośca bagiennego** | % transektu + opis | zaokrąglone do dziesiątek: >50% FV, 30–50% U1, <30% U2 |
| **Zarośnięcie przez drzewa** | % transektu + lista drzew (opcjonalnie) + opis | <10% FV, 10–30% U1, >30% U2 |
| **Uwilgotnienie** | select + czynne rowy/redliny + opis | z selecta; FV przy czynnych rowach – ostrzeżenie |
| **Gatunki obce geograficznie** | lista z % + klasa + opis | brak FV, łącznie ≤10% U1, >10% U2 |
| Ekspansywne gatunki rodzime (apofity) | lista z % + klasa + opis | brak lub <1% FV, 1–10% U1, >10% U2 |
| Stan kluczowych gatunków lokalnie typowych | select (+ „brak danych” → XX) + lista + opis | z selecta |
| Inne zniekształcenia | select + opis | z selecta |

## Interpretacje (dopowiedzenia do metodyki)
- **Kardynalne**: 4 wskaźniki z listy pod tab. 2 (wrzosiec, drzewa, uwilgotnienie, obce). Sprawozdanie 2021 potwierdza:
  „7 wskaźników, z których 4 mają status kardynalnych”.
- **Wrzosiec – zaokrąglanie**: tab. 1 definiuje miarę jako pokrycie „zaokrąglone do pełnych dziesiątek”, więc formularz
  zaokrągla przed porównaniem z progami. Skutek: 25% → 30% → U1, 54% → 50% → U1, FV od 55%. W polu „wartość” zostaje to,
  co wpisano. Zgodne z praktyką 2021 (Stawiska „ok. 30%” → U1, Tuplice 15% → U2).
- **Granice przedziałów**: tab. 2 ma „<10% / 10–30% / >30%” (drzewa) – 10 i 30 to U1. Dla obcych i apofitów
  „pojedyncze, <10% / >10%” – równo 10% liczone jako U1 (U2 dopiero „powyżej 10%”).
- **Apofity – ślad**: tab. 2 daje U1 już za „pojedyncze”, ale karta z przewodnika (jeżyna <1%) i całe sprawozdanie
  2011 („co najwyżej jeżyny <1%” → FV) oceniają ślad na FV. Formularz: łącznie poniżej 1% → FV. Dla gatunków obcych
  tego wyjątku nie ma – w 2021 r. krzywoszczeć i nawłoć kanadyjska po ≤1% dostały U1.
- **Trzęślica modra**: sprawozdanie 2021 liczy *Molinia caerulea* jako apofit i pisze, że wcześniej „omyłkowo” jej tak
  nie traktowano. W katalogu jest oznaczona jako ekspansywna; w pomocy wskaźnika jest ostrzeżenie. Przykład Gniewoszyce
  odtwarza kartę z 2011 r. (bez trzęślicy na liście) – według dzisiejszej praktyki apofity byłyby U2 (trzęślica 2–3 w
  skali Br.-Bl.), co nie zmienia ani struktury, ani oceny ogólnej (już są U2).
- **Uwilgotnienie**: tab. 2 ocenia przyczynę (antropogeniczne przesuszenie), tab. 1 skutek (czy mchy są przesycone
  wodą). Dodana opcja „ślady przesuszenia bez przyczyn antropogenicznych (np. susza)” → FV – praktyka 2021 (Torfowisko
  Pobłockie, Mierzeja Sarbska). Przesuszenie przez nalot drzew na dawnych zalesieniach liczone jak antropogeniczne
  (Gniewoszyce: U2 w 2011 i 2021). Pole „czynne rowy” tylko ostrzega przy FV.
- **Drzewa**: krzewy (kruszyna, wierzby) liczone razem z drzewami („roślinność drzewiasta”). Ocena idzie z łącznego
  pokrycia; lista gatunków jest informacyjna (suma z listy większa niż łączne pokrycie → ostrzeżenie).
- **Kluczowe gatunki**: fakultatywny i pomocniczy. „Brak danych” = XX; XX we wskaźniku pomocniczym nie zmienia oceny
  struktury w regule ogólnej, więc nie trzeba go wyłączać (`excluded`).
- **Powierzchnia**: tab. 1 każe obniżać ją, gdy zarastanie grozi zanikiem siedliska – opisane w pomocy (Gniewoszyce:
  „Siedlisko w zaniku” → U2).
- **Perspektywy**: progi z tab. 2 dosłownie; tylko z oceny eksperta.
- **Kody oddziaływań**: lista 2011, jak w sprawozdaniach 2016–2021 (B01.01, B02.01.01, B02.03, B07, C01.03, D01.01, E06,
  J02.06, K02 itd.), uzupełniona o osuszanie (J02.01), suszę (M01.02), eutrofizację (K02.03), I01/I02.

## Przykład
Gniewoszyce, 14.09.2011, wykonawca zanonimizowany („Jan Kowalski”; w karcie dodatkowa koordynatorka – usunięta).
**Oceny 1:1 jak w karcie**: powierzchnia U2, wrzosiec U2 („ok. 8–10%” → 10), drzewa U2 (ok. 40%), uwilgotnienie U2,
obce FV, apofity FV (jeżyna <1%), kluczowe gatunki XX (brak danych), inne zniekształcenia FV → struktura U2,
perspektywy U2, ocena ogólna U2. Teksty „wartości” przepisane z karty.

Drobiazgi przy przepisywaniu:
- współrzędne w przewodniku ucięte do minut („14°48′…″ E – 51°36′…″ N”) – przepisane do minut;
- zdjęcia po 25 m² (metodyka zaleca 100 m²); zwarcie D „<5%” nie mieści się w polu liczbowym – puste, wartość w uwagach;
- zdjęcie II: w karcie 198 m n.p.m., choć stanowisko ma 188–191 m – przepisane jak jest (pewnie literówka w oryginale);
- „Park Krajobrazowy Łuk Mużakowa” – w PDF zepsute kodowanie znaków, nazwa odtworzona;
- działalność człowieka: stare kody (lista 2007) przepisane na listę 2011: 160 „Gospodarka leśna – ogólnie” → B02,
  950 „Ewolucja biocenotyczna” → K02; intensywność A → H, B → M; stare kody w opisie;
- zagrożenie „Silna ekspansja drzew…” zapisane jako K02; typ stanowiska, zarządca, rok, typ monitoringu, koordynator
  i uzasadnienie monitoringu – w uwagach.
