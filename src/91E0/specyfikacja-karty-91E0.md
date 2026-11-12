# Specyfikacja karty *91E0 – Łęgi wierzbowe, topolowe, olszowe i jesionowe

Formularz wg przewodnika GIOŚ (Mróz 2010, rozdz. 91E0, tab. 1 i 2) z modyfikacjami metodyki z 2012-07-31 i 2015-07-17.
Silnik wspólny (`src/7120`), wskaźniki leśne ze wspólnego modułu `src/forest` (wątek 91I0). W `src/91E0` są tylko dane.

## Pliki

| Plik | Zawartość |
|---|---|
| `Card91E0.tsx` | `<HabitatCardForm methodology={methodology91E0} examples={examples91E0} />` |
| `habitats/methodology.ts` | pola, 16 wskaźników, progi, pomoc |
| `habitats/species.ts` | słownik gatunków, 8 podtypów z listami gatunków typowych |
| `habitats/examples.ts` | Tomasówka Górna (przykład z przewodnika, 22.07.2008) z 3 zdjęciami fitosocjologicznymi |
| testy | `habitats/methodology.test.ts`, `Card91E0.test.tsx` |

## Zmiana w silniku (addytywna)

`IndicatorDef.excluded?: boolean | (ctx) => boolean` + `isExcluded(ind, site)` w `assessment.ts`: wskaźnik się bada
i wpisuje, ale `assessCard` pomija go w ocenie struktury i w liście braków. Tabela stanu ochrony pokazuje dopisek
„nie liczy się do oceny struktury przy tym podtypie”, .docx – „(pomocniczy, nie liczy się do oceny)”.

## Stanowisko

Pola leśne jak 91D0 + **Podtyp siedliska** (wymagany): 91E0-1 … 91E0-8. Transekt 200×10 m, zdjęcia 3 × 100 m².
Termin: połowa maja – wrzesień; październik (do 15.) tylko dla górskich olszynek.

## Wskaźniki (kolejność z przykładowej karty)

Kardynalne (modyfikacja 2012): gatunki charakterystyczne, gatunki dominujące, obce gatunki inwazyjne,
martwe drewno >3 m i >50 cm, reżim wodny. Łączne zasoby martwego drewna są od 2012 r. pomocnicze.
W 91E0-6 i 91E0-7 martwe drewno (oba) i wiek drzewostanu są wyłączone z oceny (modyfikacja 2015).

| Wskaźnik | Podpowiedź |
|---|---|
| Powierzchnia | select (FV/U1/U2) |
| **Gatunki charakterystyczne** | select „kombinacja typowa / zubożona / zdominowana przez nie-łęgowe”; lista gatunków + licznik gatunków typowych podtypu (tylko pomoc) |
| **Gatunki dominujące** | select; ostrzeżenie przy „naturalne” i ≥10% gatunku inwazyjnego/ekspansywnego/obcego drzewa |
| Obce geograficznie w drzewostanie | <1% FV, <10% U1, ≥10% albo odnawianie U2 |
| **Obce gatunki inwazyjne** | brak lub 1 gatunek ≤1% FV; >1 gatunek albo >1% U1; którykolwiek ≥25% U2 *(interpretacja)* |
| Rodzime ekspansywne | select + XX „trudne do określenia” |
| Martwe drewno (łączne) | m³/ha: >20 FV, 10–20 U1, <10 U2; bez pomiaru i klasy – dawna metoda % miąższości 3/10% |
| **Martwe drewno >3 m i >50 cm** | szt./ha: >5 FV, 3–5 U1, <3 U2; pole „próg grubości 50/30 cm” |
| Naturalność koryta | select + „nie dotyczy” = XX |
| **Reżim wodny** | select |
| Wiek, struktura pionowa, odnowienie, zniszczenia, inne, kluczowe | jak 91D0 (moduł `src/forest`) |

## Przykład

Tomasówka Górna, 91E0-5. Koordynator w przewodniku to już „Jan Kowalski”. Współrzędne urwane jak w przewodniku.
Kod oddziaływania 160 (stara klasyfikacja) → B02. Podpowiedzi zgadzają się z kartą we wszystkich wskaźnikach poza
„Inne zniekształcenia” (w karcie wartość „Brak”, ocena U1 – przepisane bez zmian). Wynik: U1 / U1 / FV → U1.

## Uwagi

Raporty 2006–2008 i 2013–2014 to zestawienia wyników, nie wypełnione karty – posłużyły do listy neofitów
i uzasadnienia modyfikacji 2015.
