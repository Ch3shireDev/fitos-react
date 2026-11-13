# Specyfikacja karty 91T0 – Śródlądowy bór chrobotkowy (Cladonio-Pinetum)

Formularz karty obserwacji wg przewodnika GIOŚ (Węgrzyn i Masłowska 2010, s. 295–311, tab. 1 i 2), z modyfikacją GIOŚ
z 17.07.2015 (nowa nazwa wskaźnika stosunku pokrycia) i doprecyzowaniami ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021.
Silnik wspólny (`src/7120`), klocki leśne z `src/forest`. W `src/91T0` są tylko dane i progi 91T0. Siedlisko nie jest priorytetowe.
Karta rejestruje się sama przez `meta.ts` (trasa `/91T0` i kafelek) – `App.tsx`, `Home.tsx`, `App.test.tsx` bez zmian.

## Pliki
| Plik | Zawartość |
|---|---|
| `Card91T0.tsx` | `<HabitatCardForm methodology={methodology91T0} examples={examples91T0} />` |
| `meta.ts` | metodyka + tytuł i opis kafelka |
| `habitats/methodology.ts` | pola stanowiska, zdjęcia 3 × 100 m², 14 wskaźników (powierzchnia + 13 z tab. 2) |
| `habitats/species.ts` | ok. 70 gatunków: 10 z kombinacji charakterystycznej, porosty i mszaki towarzyszące, drzewa niezgodne z siedliskiem, ekspansywne, obce (sprawozdanie 2021); podgatunki i literówki z przewodnika |
| `habitats/examples.ts` | Bór Chrobotkowy, stanowisko 327d_01, 26.07.2007 (karta z przewodnika), zanonimizowana |

Transekt 200×10 m. Termin: najlepiej wiosna, dopuszczalne lato i jesień – ostrzeżenie poza kwietniem–październikiem.

## Wskaźniki (kolejność tab. 2, pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select | bez zmian/wzrost FV, inne U1, wyraźny spadek U2 |
| **Charakterystyczna kombinacja florystyczna** | lista gatunków | % z 10 gatunków (sosna, 5 chrobotków, wrzos, 2 borówki, śmiałek): ≥80 FV, <50 U2, reszta U1 (luka 50–59% → U1, *interpretacja*) |
| Udział siedliska na transekcie | liczba % | ≥70 FV, <30 U2, reszta U1 (luka 30–49% → U1, *interpretacja*) |
| Obce gatunki inwazyjne | lista + liczebność | brak FV, nieliczne U1, liczne U2; bez liczebności „liczne” = >5% pokrycia (*interpretacja*) |
| Rodzime gatunki ekspansywne | lista z pokryciem | suma ≤10% FV, ≤20% U1, >20% U2; ostrzeżenie, gdy krzewinka charakterystyczna ma małe pokrycie |
| **Występowanie i stan populacji chrobotków** | lista + kondycja plech + zwartość runa | gorsza z dwóch ocen; ostrzeżenia przy płucnicy kolczastej i runie jednogatunkowym |
| **Stosunek pokrycia chrobotków do mchów i roślin naczyniowych** | pokrycie porostów, mszaków, roślin naczyniowych | udziały w runie; porosty+mszaki ≥90 FV, <60 U2; porosty ≥60 FV, <40 U2; gorsza z dwóch (luki → U1, porosty >90% → FV, *interpretacja*) |
| Wiek drzewostanu | lata + udział starodrzewu | >90 FV, 50–90 U1, <50 U2. **Niekardynalny** – jak w monitoringu 2021 (w przewodniku 2010 kardynalny) |
| **Obecność drewna martwego w dnie lasu** | select | brak FV (pojedyncze gałęzie się nie liczą – sprawozdanie 2014), naturalny opad U1, stosy gałęzi U2 |
| Gatunki obce w drzewostanie | lista + liczebność | jak obce inwazyjne |
| Naturalne odnowienie | lista + select | małe ilości FV, brak lub liczne U1, bardzo liczne U2 (wg tab. 2, nie tekstu tab. 1); ostrzeżenie >10% |
| Obecność nasadzeń drzew | lista + select | brak / nieliczne / bardzo liczne |
| Pozyskanie drewna i inne przekształcenia | select | słabe / średnie / duże |
| Zniszczenia drzewostanów | select + % | brak / średnie / bardzo intensywne |

## Przykład
Bór Chrobotkowy (cykl 2006–2008). Zdjęcia 400 m² jak w karcie. Oceny parametrów FV jak w karcie. Trzy podpowiedzi różnią się
od eksperta i formularz to pokazuje: kombinacja florystyczna (6/10 → U1), stosunek pokrycia („80/20” → U1; karta z 2007 r. używała
starszego kryterium) i odnowienie („nieliczne” → FV, ekspert U1). Wykonawca: „Jan Kowalski”.
