# Specyfikacja karty 7110 – Torfowiska wysokie z roślinnością torfotwórczą (żywe)

Formularz karty obserwacji wg przewodnika GIOŚ (Stańko 2010, cz. I, s. 145–160, tab. 1 i 2, lista wskaźników kardynalnych,
karta „Supraśl” 2008) z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021. Siedlisko
priorytetowe (*7110). Silnik wspólny (`src/7120`) – **bez zmian**; z 7120 brane są też pola stanowiska, zdjęć
fitosocjologicznych i „Innych informacji” (`pickField`, z własnymi opisami). Z `src/forest` – tylko generyczne klocki
(`selectInput`, `speciesInput`, `listCover`, `labelOf`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 10×200 m (ta sama powierzchnia przy innym kształcie, np. 100×20, 50×40; płat <20 arów – centralna
część 10×10 m), 3 zdjęcia po 25 m² co 100 m. Termin: sierpień, w praktyce lipiec–sierpień (ostrzeżenie poza).
Podtyp 7110-1 niżowe / 7110-2 górskie – opcjonalny, nie zmienia progów.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select + ha + opis | bez zmian/wzrost FV, inne U1, wyraźny spadek U2, brak danych XX |
| **Gatunki charakterystyczne** | lista z pokryciem | torfowce ≥3 i naczyniowe ≥2 FV; ≥2 i ≥2 U1; reszta U2 |
| Gatunki dominujące | lista z pokryciem | brak – pozycja z karty przykładowej, pominięta w ocenie struktury |
| **Pokrycie i struktura gatunkowa torfowców** | lista torfowców / pokrycie i udział kępkowych ręcznie | torfowce >50% i kępkowe >40% FV; torfowce <20% albo kępkowe <5% U2; reszta U1 |
| Obce gatunki inwazyjne | select + lista + łączne pokrycie | brak/siewki FV, do 5% U1, >5% U2 |
| Rodzime gatunki ekspansywne roślin zielnych | lista + łączne pokrycie | 0 FV, do 5% U1, >5% U2 |
| **Odpowiednie uwodnienie** | 5 pomiarów (cm) albo opis z obserwacji | średnia ≤10 FV, ≤30 U1, >30 U2 |
| Struktura powierzchni torfowiska | select | kępkowo-dolinkowy lub kontynentalny dywanowy FV; dywanowy z płatami / częściowa U1; brak U2 |
| **Pozyskanie torfu** | select + sposób | z selecta |
| **Melioracje odwadniające** | select | brak/zneutralizowane FV, słaby wpływ U1, wyraźny U2 |
| **Obecność krzewów i drzew** | lista / pokrycie drzew i krzewów ręcznie | gorsza z: drzewa <10 FV, 10–30 U1, >30 U2; krzewy <30 FV, 30–50 U1, >50 U2; drzewa >50% – ostrzeżenie (91D0) |

Pierwszeństwo danych: liczby wpisane ręcznie > lista gatunków > opis z selecta. Pole „Opis” każdego wskaźnika, gdy
wypełnione, trafia do „wartości” w karcie.

## Interpretacje
- **Gatunki charakterystyczne**: „wymienione gatunki” = suma list z tab. 1 i „Typowych gatunków roślin”: torfowce
  kępkowe (magellański i segregaty S. medium / S. divinum, brodawkowaty, brunatny, czerwonawy, ostrolistny), Russowa,
  dolinkowe (kończysty, szpiczastolistny, wąskolistny, bałtycki, delikatny, większy – wymienione w sprawozdaniu 2021);
  naczyniowe Oxycocco-Sphagnetea (modrzewnica, rosiczka okrągłolistna, żurawiny, wełnianka pochwowata, wełnianeczka
  darniowa, turzyca skąpokwiatowa, wrzosiec, moroszka, bażyna), „silnie związane” bagno i borówka bagienna oraz gatunki
  dolinek z tab. 1 (turzyca bagienna, przygiełka biała, bagnica). Kombinacje poniżej U1 (np. 3 torfowce + 1 naczyniowa)
  – U2 (tab. 2 opisuje U2 tylko jako „1 + 1”).
- **Torfowce**: kępkowe równo 5% – U1 (tab. 2 ma 5% w U1 i U2). Opis „dominuje grupa kończystego” jest informacyjny;
  progi liczbowe decydują.
- **Krzewy**: bagno zwyczajne i borówka bagienna liczone do krzewów (tab. 2), choć są też charakterystyczne. Wrzos
  liczony do ekspansywnych, nie do krzewów (tab. 1), żeby nie liczyć go dwa razy. Praktyka 2021: krzewinki 80–95% → U2.
- **Struktura powierzchni**: przewodnik ogranicza wskaźnik do zasięgu torfowisk kępkowo-dolinkowych. Dla torfowisk
  kontynentalnych dodana opcja „naturalny mszar dywanowy” = FV (jak Sicienko 2021).
- **Pozyskanie torfu**: luka „niewielka skala, ale <30 lat temu” – U1.
- **Melioracje**: inaczej niż w 7120 samo naturalne zarastanie rowów to U1, nie FV.
- **Obce**: pojedyncze siewki dębu czerwonego, które nie przeżywają – FV (praktyka 2021).
- **Gatunki dominujące**: w przykładowej karcie są, w tab. 1–2 i sprawozdaniach nie – wskaźnik `excluded`, bez
  podpowiedzi. Karta wymaga wartości i oceny (można XX).
- **Kody oddziaływań**: stary słownik (jak w 7120) – kody z tabel sprawozdania 2013–2014 plus susza M01.02 (2021).

## Przykład Supraśl (2008)
- Koordynator zanonimizowany (Jan Kowalski), współrzędne ucięte do minut jak w przewodniku.
- Do gatunków charakterystycznych dopisany torfowiec kończysty 30% (z wiersza torfowców); bez niego 2 torfowce → U1.
- Torfowce: karta pisze „40% zajęte przez torfowce”, ale S. magellanicum ma 60% transektu, a warstwa d 90–100% –
  przyjęto pokrycia transektu (92%, kępkowe 67%) → FV jak w karcie. Dosłowne 40% dałoby U1.
- Wszystkie podpowiedzi zgodne z ekspertem, z sosną 40% → „Obecność krzewów i drzew” U2. Karta mimo to podaje
  strukturę FV i ocenę ogólną FV – sprzeczne z regułą tab. 2 (kardynalny U2 → U2). Formularz liczy U2.
  W 2021 r. stanowisko wyłączono z monitoringu: przeszło w bór bagienny.
- Termin 30.06 – ostrzeżenie (poza lipcem–sierpniem).
