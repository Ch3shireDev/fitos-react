# Specyfikacja karty 3260 – Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników (Ranunculion fluitantis)

Formularz karty obserwacji wg przewodnika GIOŚ (Szoszkiewicz, Gebler 2012, cz. II, s. 204–217, tab. 1–3, przykładowa
karta Kanał Miejski – Sławno) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2024. Siedlisko wodne,
niepriorytetowe, region kontynentalny. Karta rejestruje się sama przez `meta.ts`. Z `src/forest` tylko klocki generyczne,
słownik oddziaływań 2011 z `src/rdos/dictionaries.ts` (tylko odczyt).

Stanowisko: odcinek hydromorfologiczny RHS 500 m (10 profili co 50 m), w nim odcinek makrofitowy MMOR 100 m
(między 6. a 8. profilem). Pokrycie gatunków w 9-stopniowej skali MMOR (tab. 1). Jedno zdjęcie fitosocjologiczne
(jak w karcie z przewodnika). Termin: lipiec–sierpień (ostrzeżenie poza nim), co 3–6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 3)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | z listy włosieniczników (najwyższy MMOR bez krążkolistnego) albo MMOR wprost + opis | ≥3 FV, 1–2 U1, brak U2 |
| **Gatunki charakterystyczne – włosieniczniki** | tabela: gatunek + MMOR, „nie stwierdzono” | ≥2 FV, 1 U1, brak/tylko krążkolistny U2 |
| **Gatunki charakterystyczne – inne** | tabela: gatunek (6 z tab. 2 albo „inny”) + MMOR | ≥2 gat. FV, 1 U1, 0 U2 |
| **Materiał dna koryta** | % frakcji RHS (kamienie, kamyki/żwir, narzut, piasek, muł, inne) | grub. ≥20% i muł ≤20% FV; muł ≤20% U1; muł >20% U2 |
| **Ocena stanu ekologicznego** | klasa I–V + MIR (opis) | I–II FV, III U1, IV–V U2 |
| **Moczarka kanadyjska** | MMOR 0–9 | 0–2 FV, 3–5 U1, >5 U2 |
| **Przepływy** | % typów przepływu RHS | szybkie (kipiel+rwący+wartki) >40 FV, 10–40 U1, <10 U2 |
| **Spiętrzenie wód rzeki** | select | brak FV, <33% U1, >33% U2 |
| **HQA** | liczba | ≥50 FV, 30–50 U1, ≤30 U2 |
| **HMS** | liczba | ≤20 FV, 20–40 U1, ≥40 U2 |
| Naturalne elementy morfologiczne | tabela rodzajów form (7 z RHS) | ≥3 FV, 1–2 U1, 0 U2 |
| Zacienienie rzeki | zadrzewienie L/P 0–5, zacienienie 0/1/3 albo % wprost | ≤50 FV, ≤80 U1, >80 U2 |
| Gatunki inwazyjne | tabela: gatunek + stwierdzony/liczny | 0–2 FV, 3–4 U1, ≥5 albo liczny U2 |
| Ścieki | select | nie FV, tak U1, tak + zastoiska U2 |

## Zmiana w silniku (jedyna poza `src/3260`)
`Methodology.structureRule` (opcjonalna) + typ `StructureItem` w `src/7120/habitats/types.ts`; `assessCard` używa jej
zamiast `aggregateStructure`, gdy karta ją poda (`src/7120/habitats/assessment.ts`, 2 linie). Wstecznie zgodne – inne karty
bez zmian. Powód: tab. 3 dla 3260 ma zupełnie inną regułę struktury niż ogólna („jedno kardynalne U2 → U2”). Reguła
ogólna dawałaby U2 na ok. 30% stanowisk z samego braku włosieniczników, a GIOŚ w 2024 r. ma tylko 15% U2 struktury –
monitoring stosuje regułę z tab. 3. Bez zmiany silnika przykład z przewodnika wychodziłby strukturą U2 zamiast U1.

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Reguła struktury** (`structureRule3260`): tab. 3 jest nieostra („FV: maks. 2 wskaźniki na U2 lub 3 na U1, pozostałe
  FV; U1: maks. 2 kardynalne na U2 (U1 bez ograniczeń); U2: więcej niż 2 kardynalne U2”). Przyjęto: U2 gdy >2 kardynalne
  U2; FV gdy (≤2 U2 i zero U1) albo (zero U2 i ≤3 U1) licząc **wszystkie** 13 wskaźników (kolumna FV nie mówi
  „kardynalne”, a inaczej pomocnicze nie miałyby żadnego wpływu); reszta U1. U1 i U2 naraz – już nie FV. XX w kardynalnym → XX.
  Uwaga: literalnie FV dopuszcza 2 kardynalne U2 (np. brak włosieniczników) – tak stoi w tab. 3; ocenę ogólną i tak
  ściąga wtedy powierzchnia U2.
- **Ocena ogólna**: silnik, „najgorszy decyduje”. Przewodnik 2012 miał inną regułę (FV: powierzchnia FV + jeszcze jeden
  parametr FV; U1: powierzchnia co najmniej U1; U2: powierzchnia U2), ale sprawozdanie 2024 mówi wprost, że od drugiego
  cyklu obowiązuje „najgorszy decyduje” (Sławno 2016 = U2 przy tych samych parametrach FV/U1/U2).
- **Powierzchnia**: „pokrycie chronionymi włosienicznikami co najmniej na 3” – brany najwyższy współczynnik MMOR spośród
  gatunków (sumowanie klas MMOR nie ma sensu); można wpisać pokrycie łączne wprost.
- **Włosieniczniki**: liczy się najwyższy współczynnik; krążkolistny wpisywalny, ale nieliczony. Synonimy Ranunculus = Batrachium.
- **Gatunki charakterystyczne – inne**: liczą się tylko z tab. 2; „inne” makrofity (jak potocznik i przetacznik w karcie
  Sławno) idą do opisu. Sprawozdanie 2024 opisuje FV jako „co najmniej jeden gatunek” – rozjazd z tab. 3, formularz trzyma się tab. 3.
- **Materiał dna**: gruboziarnisty = kamienie + kamyki/żwir + narzut kamienny; FV wymaga też mułu ≤20%. Ostrzeżenie, gdy suma ≠ 100%.
- **Stan ekologiczny**: granice klas MIR zależą od typu abiotycznego rzeki – formularz nie zgaduje klasy z wartości, MIR tylko do opisu.
- **Przepływy**: szybkie tylko kipiel, rwący, wartki (tab. 3); spadek swobodny i kaskadowy w „inne”.
- **HQA/HMS**: „między 30 a 50” / „między 20 a 40” – granice należą do skrajnych klas (≥50 FV, ≤30 U2; ≤20 FV, ≥40 U2), jak w tab. 3.
- **Zacienienie**: wzór z tab. 2: (zadrzewienie L+P) × zacienienie (0/1/3) / 30; 50% → FV, 80% → U1.
- **Gatunki inwazyjne**: „pow. 5” → 5 liczone do U2 (inaczej 5 nie ma oceny). Zero gatunków → FV. Moczarka kanadyjska
  pomijana (osobny wskaźnik), moczarka delikatna w katalogu jako obca. Synonimy (Padus/Prunus serotina) liczone raz.
- **Data wypełnienia**: jak w innych kartach – w uwagach.
- **Kody oddziaływań**: słownik 2011 (jak sprawozdania 2016–2018 i 2024), lista kodów spotykanych na stanowiskach 3260.

## Przykład
Kanał Miejski – Sławno, 16.07.2011, wykonawca zanonimizowany („Jan Kowalski”). Wszystkie 14 ocen wskaźników jak w karcie
(podpowiedzi z pomiarów = oceny). Powierzchnia FV, **struktura U1 – jak w karcie**, perspektywy U2.
**Rozbieżność: ocena ogólna U2, w karcie U1** – karta użyła reguły z 2012 r., formularz „najgorszy decyduje” (patrz wyżej).
Wartości przepisane z karty dosłownie („Ranunculus fluitans – 6”, „Veronica anagalis-aquatica”). Stan ekologiczny „dobry”
→ II klasa. Zacienienie 17% wpisane wprost (karta nie podaje danych RHS). Współrzędne ucięte w przewodniku – do minut.
Kod 400 (A, –) → E01, intensywność H, stary zapis w opisie. Zagrożeń karta nie ma.
