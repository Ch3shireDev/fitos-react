# Specyfikacja karty 91P0 – Jodłowy bór świętokrzyski (Abietetum polonicum)

Formularz karty obserwacji według przewodnika GIOŚ (Lorens 2010, tab. 1 i 2) z waloryzacją odnowienia buka z monitoringu 2021.
Działa na wspólnym silniku (`src/7120`) i wspólnym module leśnym (`src/forest`, utrzymywany razem z 91D0/91E0/91F0/91I0).
W `src/91P0` są tylko dane i progi 91P0.

## Pliki

| Plik | Zawartość |
|---|---|
| `Card91P0.tsx` | `<HabitatCardForm methodology={methodology91P0} examples={examples91P0} />` |
| `habitats/methodology.ts` | pola (forestSiteFields, forestReleveFields 100 m²), 12 wskaźników z presetów `src/forest`, progi tab. 2 |
| `habitats/species.ts` | ok. 90 gatunków: typowa kombinacja, ekspansywne, obce, gatunki borów sosnowych i grądów, synonimy z karty |
| `habitats/examples.ts` | Stary Lipowiec 16.08.2008 (przykładowa karta z przewodnika), zanonimizowany |

## Wskaźniki (kolejność tab. 2, pogrubione = kardynalne)

| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select | bez zmian/wzrost FV, inne U1, wyraźny spadek U2 |
| **Charakterystyczna kombinacja florystyczna** | lista + select | z selecta; wyjaśnienie liczy gatunki o najwyższej frekwencji i jodłę; ostrzeżenie przy braku jodły lub gatunkach grądowych (9170/9130) |
| Obce gatunki inwazyjne | lista | łączne pokrycie ≤1% FV, 1–5% U1, >5% U2 |
| **Rodzime gatunki ekspansywne** | lista | <25% FV, 25–50% U1, >50% U2 |
| **Obecność martwego drewna** | select klasy + % zasobności + „całe martwe drzewa?” + pnie >20 cm | >10% FV, 3–10% U1, <3% U2; same gałęzie i pniaki → U2 *(interpretacja)* |
| Wiek drzewostanu | select + udziały | preset standAge (20%/100 lat, 50%/50 lat), liczby sprawdzają zgodność |
| Gatunki obce w drzewostanie | lista | brak FV, do 10% U1, >10% U2 *(<5% jako U1 – interpretacja zgodna ze sprawozdaniem 2021)* |
| **Naturalne odnowienia jodły** | lista (jodła + % transektu) | >5% FV, >0–5% U1, brak U2 |
| Naturalne odnowienia buka | lista (buk + % transektu) | <25% i brak FV, 25–50% U1, >50% U2 (zmiana z 2021: brak nie daje już U2) |
| Obecność nasadzeń drzew | lista + select | brak/zgodne FV, nieliczne U1, liczne U2 |
| Zniszczenia runa i gleby (pozyskanie) | select | brak / <1% / >1% |
| Zniszczenia drzewostanów (wiatrołomy, gradacje) | select + % zasobności | <3% FV, 3–5% U1, >5% U2 |

Termin optymalny: lipiec–sierpień (ostrzeżenie poza nim). Zdjęcia fitosocjologiczne: 3 × 100 m².

## Przykład

Stary Lipowiec (karta z przewodnika, cykl 2006–2008). Wskaźniki, których już nie ma (gatunki dominujące, jeżyny/maliny/bez), przeniesiono do kombinacji florystycznej i gatunków ekspansywnych; stare kody 160/164/166 → B02/B02.02/B02.04.
Oceny przepisane z karty: powierzchnia FV, struktura U2 (martwe drewno), perspektywy XX, ogólna U2. Dwie różnią się od dzisiejszych progów i formularz to pokazuje: odnowienie buka (U2 w 2008 → dziś FV) i obce inwazyjne (ekspert U1 przy ≤1%).
Wykonawca: „Jan Kowalski”.
