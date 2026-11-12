# Specyfikacja karty 40A0 – Subkontynentalne zarośla okołopannońskie

Formularz karty obserwacji siedliska 40A0 według przewodnika GIOŚ (tom IV, rozdz. 40A0, tab. 1 i 2) i sprawozdań z monitoringu 40A0 (2013–2014, 2016–2018, 2024).
Działa na wspólnym silniku z kartą 7120 (`src/7120/components/habitat-form`, `src/7120/habitats`) **bez żadnych zmian w silniku**. Obowiązują więc wszystkie zasady
z `src/7120/specyfikacja-karty-7120.md`: etykiety nad polami, popovery „?”, tryb dla początkujących, tabela stanu ochrony z nagłówkami grup, wspólna kolumna ocen,
wersja robocza w IndexedDB, potwierdzenia przed utratą danych, zapis do .zip, eksport .docx i PWA offline.

## Pliki

| Plik | Zawartość |
|---|---|
| `src/40A0/Card40A0.tsx` | `<HabitatCardForm methodology={methodology40A0} examples={examples40A0} />` |
| `src/40A0/habitats/methodology.ts` | metodyka jako dane: pola, 12 wskaźników, progi, pomoc, kody oddziaływań |
| `src/40A0/habitats/species.ts` | słownik ok. 150 gatunków z grupami, warianty siedliska, liczenie klas |
| `src/40A0/habitats/examples.ts` | Garb Pińczowski (16.05.2013) z karty w przewodniku, zanonimizowany |
| `src/40A0/habitats/methodology.test.ts`, `src/40A0/Card40A0.test.tsx` | testy (24 + 4) |
| `src/App.tsx`, `src/home/Home.tsx`, `src/App.test.tsx` | trasa `/40A0`, wpis na początku listy siedlisk, test nawigacji |

## Stanowisko

Pola jak w karcie z przewodnika: nazwa, GUID, **wariant siedliska** (wymagany), typ stanowiska, zbiorowiska, opis, powierzchnia płatów (ha), obszary chronione,
zarządzający terenem, współrzędne (początek wymagany; środek i koniec opcjonalne – zamiast transektu mogą to być kolejne płaty), wymiary transektu,
wysokość n.p.m., data (ostrzeżenie poza końcem kwietnia–lipcem), wykonawca (ekspert lokalny), dodatkowi eksperci.

| Wariant | Gatunek siedliskotwórczy | Skutki |
|---|---|---|
| `cerasus` – zarośla wisienki stepowej (Prunetum fruticosae) | Cerasus fruticosa | wszystkie wskaźniki jak w tab. 2 |
| `cotoneaster` – naskalne zarośla irgi (Junipero communis-Cotoneasteretum integerrimi) | Cotoneaster integerrimus | fragmentacja naturalna (podpowiedź FV); wysokość krzewów wisienki: XX i **nie kardynalna**; gatunki ekspansywne dają ostrzeżenie o degeneracji |

Zdjęcia fitosocjologiczne: domyślnie 3 × 25 m² (5×5 m); przewodnik dopuszcza 1–3 przy małych płatach.

## Wskaźniki

Kolejność z karty w przewodniku, plus „Struktura przestrzenna zarośli” ze sprawozdań (razem 11 wskaźników struktury, jak w monitoringu 2013–2024).
Pogrubione = kardynalne.

| Wskaźnik | Dane | Podpowiedź oceny |
|---|---|---|
| Powierzchnia siedliska (parametr) | select | nie maleje / niewielki spadek / wyraźny spadek |
| Powierzchnia zajęta przez siedlisko na transekcie | % (opcjonalne) | >60 FV, 40–60 U1, <40 U2 *(interpretacja sprawozdań – w tab. 2 brak progów)* |
| Struktura przestrzenna płatów | select | brak/nieznaczna FV, średnia U1, duża U2; w zaroślach irgi zawsze FV |
| Struktura przestrzenna zarośli | select | zwarte FV / pofragmentowane U1 / kadłubowe U2 / brak danych XX *(opisy ze sprawozdań)* |
| Gatunki charakterystyczne | lista gatunków | słabsza z dwóch klas (Rhamno-Prunetea, Festuco-Brometea): >4 FV, 3–4 U1, ≤2 U2 |
| **Stan populacji gatunków charakterystycznych** | select | brak oznak FV / nieliczne U1 / częste U2 |
| **Udział wisienki lub irgi w warstwie krzewów** | % | >75 FV, 50–75 U1, <50 U2 |
| Zwarcie drzew i krzewów innych niż wisienka/irga | lista + opcjonalna suma | <25 FV, 25–50 U1, >50 U2; wisienka/irga na liście jest pomijana z ostrzeżeniem |
| **Wysokość krzewów wisienki** (kardynalny tylko w `cerasus`) | min, max, średnia (cm) | ze średniej: <120 FV, 120–150 U1, >150 U2; irga → XX |
| Obce gatunki inwazyjne | lista | brak lub tylko pojedyncze (<1%) nisko inwazyjne FV; nisko inwazyjne <5% albo silnie inwazyjne <1% U1; reszta U2 |
| Gatunki ekspansywne roślin zielnych | lista + opcjonalna suma | <20 FV, 20–50 U1, >50 U2 |
| Wojłok | min, max, średnia (cm) | ze średniej, a bez niej ze środka zakresu: <10 FV, 10–15 U1, >15 U2 |

Agregacja struktury jak w silniku: U2 w kardynalnym → U2; XX w kardynalnym → XX; wszystkie kardynalne FV i brak U2 w pozostałych → FV; inaczej U1.
Przewodnik pisze „pozostałe w większości przynajmniej U1” – silnik stosuje ostrzejsze „brak U2”, tak samo jak dla 7120 i 91D0.

## Przykład

Garb Pińczowski, 16.05.2013 – jedyna pełna karta w materiałach (sprawozdania zawierają tylko zestawienia). Wykonawca: Jan Kowalski.
Wynik jak w karcie: powierzchnia FV, struktura FV, perspektywy FV, ogólna FV.

Rozbieżność z progami: **gatunki ekspansywne** – trzcinnik 10% + perz siny 15% = 25%, progi dają U1, ekspert dał FV. Test pilnuje, że to jedyna rozbieżność.

Interpretacje danych przykładu (karta nie podaje liczb): nachylenie 25/20/5% → 14/11/3°, udział wisienki „od 100% do 60%” → 80%,
zwarcie innych krzewów „10–20%” → 15%, wojłok „5–10 cm” → min 5 / max 10. „Struktura przestrzenna zarośli” → XX (wskaźnika nie było w karcie).
Intensywność oddziaływań A/B/C przepisana na H/M/L; K02.01 ma w karcie wpływ „−/+” – w formularzu „−” z dopiskiem w opisie.

## Testy

`npx vitest run` – 146 testów (w tym 28 dla 40A0). `tsc`, `vite build` czyste; sprawdzone w Chromium na 1280 px i na iPhonie (tryb ciemny), konsola bez błędów; eksport .docx otwarty w LibreOffice.
