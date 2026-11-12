# Specyfikacja karty 91Q0 – Górskie reliktowe laski sosnowe (Erico-Pinion)

Formularz karty obserwacji wg przewodnika GIOŚ (Perzanowska 2010, s. 284–294, tab. 1 i 2), z doprecyzowaniami ze sprawozdań
z monitoringu 2006–2008, 2013–2014 i 2021. Silnik wspólny (`src/7120`), klocki leśne z `src/forest`. W `src/91Q0` są tylko dane i progi 91Q0.
Siedlisko nie jest priorytetowe (kod bez gwiazdki; gwiazdka w nagłówku raportu 2006–2008 jest błędem tamtego dokumentu).

## Pliki
| Plik | Zawartość |
|---|---|
| `Card91Q0.tsx` | `<HabitatCardForm methodology={methodology91Q0} examples={examples91Q0} />` |
| `habitats/methodology.ts` | pola stanowiska (+ podtyp 91Q0-1 Pieniny / 91Q0-2 Tatry), zdjęcia 3 × 25 m², 10 wskaźników tab. 2 |
| `habitats/species.ts` | ok. 75 gatunków: charakterystyczne (z regionem), ciepłolubne, drzewa obce ekologicznie, ekspansywne, obce; literówki z przewodnika |
| `habitats/examples.ts` | Macelowa Góra 30.07.2008 (karta z przewodnika), zanonimizowana |

Transekt 200×10 m (na skałach często cały płat – pomoc to opisuje). Termin: czerwiec (Pieniny), lipiec (Tatry) – ostrzeżenie poza nimi.

## Wskaźniki (kolejność tab. 2, pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select | bez zmian/wzrost FV, inne U1, wyraźny spadek U2 |
| **Gatunki charakterystyczne** | lista + „czy dominują w runie” | >5 gat. FV (gdy nie dominują – U1, *interpretacja*), 1–5 U1, brak U2; drzewa obce/ekspansywne z listy się nie liczą (ostrzeżenie) |
| Obce gatunki inwazyjne | lista + pojedynczo/łanowo | brak FV, 1 gatunek pojedynczo U1, łan lub >1 gatunek U2 |
| **Rodzime gatunki ekspansywne** | lista + pojedynczo/łanowo | brak FV, 1–2 gatunki pojedynczo U1, łan lub >2 gatunki U2 |
| **Struktura drzewostanu** | select + wysokość, pierśnica, zwarcie | zróżnicowany FV, jednowiekowy z podrostem U1, jednowiekowy niezróżnicowany U2 |
| **Gatunki obce w drzewostanie** | lista + liczebność + nasadzenia | brak FV; 1 gatunek U1 (także przy większym udziale – jak w ocenach 2014, *interpretacja*); nasadzenia lub >1 gatunek w licznych populacjach U2 |
| Naturalne odnowienie | lista + sosna + świerk (buk, jodła) | gorsza z dwóch ocen; buk i jodła jak świerk (sprawozdanie 2021) |
| Pozyskanie drewna i inne przekształcenia | select | brak / pojedyncze działania / gospodarka leśna |
| Gatunki ciepłolubne w runie | lista + select zestawu | z selecta; ostrzeżenie, gdy U1/FV przy ≤3 gatunkach lub U2 przy >3 |
| Zniszczenia mechaniczne | select + % | brak lub naturalne FV, antropogeniczne <30% U1, >30% U2 |

„Łanowo” bez wybranego sposobu występowania = gatunek o pokryciu ≥5% (*interpretacja*).

## Przykład
Macelowa Góra (91Q0-1, cykl 2006–2008). Wskaźniki spoza tab. 2 z karty 2008 (udział na transekcie, dominanty, gatunki nawapienne,
wiek drzewostanu) przeniesiono do uwag. Wszystkie parametry FV jak w karcie. Jedna podpowiedź różni się od eksperta i formularz
to pokazuje: naturalne odnowienie (świerk „miejscami dość licznie” → U1, ekspert FV). Wykonawca: „Jan Kowalski”.
