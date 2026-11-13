# Karta 2180 – Lasy mieszane i bory na wydmach nadmorskich

## Źródła
- **Metodyka**: Lemke D. 2015. 2180 Lasy mieszane i bory na wydmach nadmorskich. W: Mróz W. (red.) *Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. IV*, GIOŚ, s. 75–86 (tab. 1, tab. 2, przykładowa karta Białogóra 2013).
- **Raporty**: wyniki monitoringu 2013–2014 (48 stanowisk), 2016–2018 (46), sprawozdanie 2024 (46).

## Pliki
`src/2180/`: `Card2180.tsx`, `meta.ts` (rejestracja), `habitats/methodology.ts` (wskaźniki i progi), `habitats/species.ts` (katalog, listy gatunków charakterystycznych), `habitats/examples.ts` (Białogóra), testy. Silnik `src/7120` i `src/forest` bez zmian.

## Stanowisko
Pola leśne (`forestSiteFields`) + wybór **zbiorowiska**: *Empetro nigri-Pinetum* (bór bażynowy) albo *Betulo pendulae-Quercetum roboris* (las brzozowo-dębowy). Transekt 10×200 m (albo 1 ha), 3 zdjęcia fitosocjologiczne 10×10 m co 100 m. Termin: czerwiec–wrzesień (ostrzeżenie poza oknem).

## Wskaźniki (kolejność tab. 2)

| Wskaźnik | Kard. | FV | U1 | U2 | Jak liczy formularz |
|---|---|---|---|---|---|
| Powierzchnia siedliska | – | bez zmian / rośnie | niewielki spadek | wyraźny spadek | wybór opisu |
| **Gatunki charakterystyczne** | ✔ | całe spektrum; w Empetro bażyna ≥ st. 2 B-B | większość, brak najbardziej typowych | silnie zubożona | wybór opisu + warunek bażyny (≥5% pokrycia) |
| Gatunki dominujące | – | dominują charakterystyczne | nie we wszystkich warstwach | dominanty ekspansywne / obce | wybór opisu, ostrzeżenie przy obcym dominancie ≥10% |
| Obce gatunki inwazyjne w podszycie i runie | – | brak | pojedyncze egz. 1 gatunku bez ekspansji | >1 gatunek lub ekspansja | lista + „czy ekspansja” |
| Struktura wiekowa | – | >10% drzew starych | <10%, ale obecne | brak | % drzew >80–100 lat |
| Gatunki obce ekologicznie w drzewostanie | – | <10% | 10–50% | >50% | lista; **poza oceną struktury** |
| **Gatunki obce geograficznie w drzewostanie i podroście** | ✔ | <1% | 1–10% | >10% lub silnie się odnawiają | lista + „czy silnie się odnawiają” |
| Martwe drewno (łączne zasoby) | – | >5 m³/ha | <5 m³/ha, ale obecne | brak | klasa + opcjonalnie m³/ha |
| Naturalne odnowienie | – | obfite, reaguje na prześwietlenia | pojedyncze | brak | wybór opisu |
| Inne zniekształcenia, w tym zniszczenia runa i gleby po pozyskaniu drewna | – | brak | pojedynczo, bez znaczenia | silne | wybór opisu |

Agregacja struktury i oceny ogólnej – wspólny silnik (tab. 2: wszystkie kardynalne FV i reszta bez U2 → FV; kardynalny U2 → U2).

## Dopowiedzenia i interpretacje
1. **Bażyna czarna**: „st. 2 B-B” = pokrycie ≥5% na liście gatunków. Wybrane FV przy bażynie <5% albo nieobecnej → podpowiedź U1. Bażyna wpisana bez pokrycia – bez obniżenia, prośba o pokrycie. Brak bażyny nie daje automatycznie U2, choć raport 2018 tak ją najczęściej oceniał (wtedy wybierz U2 ręcznie).
2. **Gatunki charakterystyczne** – tab. 2 jest opisowa, więc ocena idzie z wyboru eksperta. Formularz tylko pokazuje, ile pozycji listy zbiorowiska (tab. 1) jest obecnych; nie wymyśla progu procentowego.
3. **Struktura wiekowa**: równo 10% → FV (raporty 2018 i 2024: „co najmniej 10%”; tab. 2: „>10%”).
4. **Martwe drewno**: równo 5 m³/ha → U1 (zasoby mają „przekraczać próg”).
5. **Obce geograficznie**: 1% i 10% → U1 (tab. 2: „1–10%”). „Silnie odnawiające się” jako osobny wybór – U2 niezależnie od udziału.
6. **Obce inwazyjne**: bez odpowiedzi „czy ekspansja” pokrycie ≤1% = „pojedyncze egzemplarze” (U1), więcej → U2.
7. **Gatunki obce ekologicznie**: w tab. 2, ale od 2018 r. GIOŚ ich nie ocenia (raport 2016–2018, pkt 9; 2024 – 9 wskaźników bez nich), karta przykładowa też ich nie ma. Wskaźnik jest w karcie (`excluded`), ale nie liczy się do struktury.
8. **Zniekształcenia**: jeden wskaźnik jak w tab. 2, przykładowej karcie i praktyce 2018. W 2024 r. znów rozdzielono „zniszczenia runa i gleby” (74% stanowisk XX) – nie powielam.
9. **Nazwa wskaźnika inwazyjnych**: wg tab. 2 („Obce gatunki inwazyjne…”); nazwa z 2018/2024 („Ekspansywne gatunki obce…”) w opisie.
10. **Katalog**: kosodrzewina, sosna czarna, wydmowa, Banksa, wejmutka, świerk (wg tab. 1 obcy na wybrzeżu), dąb czerwony, czeremcha amerykańska, róża pomarszczona, śliwa domowa, śnieguliczka + neofity z tab. 1. Buk = obcy ekologicznie (raport 2018). Porzeczka alpejska jako krzew rodzimy (tab. 1 ją wymienia w Betulo-Quercetum, raport 2018 traktował jak obcą).
11. **Kody oddziaływań**: wspólne leśne + kody z raportów (B02.05, D01, E01.03, G01, G01.02, G04.01, G05.01, H05.01, J02.12.01, K01.01, M01.07, U, X).

## Przykład Białogóra (karta z przewodnika, 19.10.2013)
Wszystkie oceny wskaźników jak w karcie, podpowiedzi formularza zgodne z ekspertem w każdym ocenianym wskaźniku: martwe drewno U1, odnowienie U1, reszta FV. Powierzchnia FV, struktura FV, perspektywy FV.

**Jedna rozbieżność – ocena ogólna.** Karta podaje U1 („powierzchnia o różnym stanie zachowania: FV 20%, U1 80%”), mimo że wszystkie trzy parametry ma na FV, a tab. 2 tej samej metodyki mówi „wszystkie parametry FV → FV”. Raport 2013–2014 dla Białogóry podaje z kolei strukturę U1 i ogólną U1. Formularz liczy ocenę ogólną sam (wspólny silnik, bez ręcznego nadpisania), więc wychodzi **FV**; rozkład 20/80 i U1 z karty są w uzasadnieniu oceny ogólnej i w uwagach. Ruszania silnika dla jednej wewnętrznie sprzecznej karty nie robiłem.

Inne uwagi do przepisania:
- wykonawca zanonimizowany (Jan Kowalski), jak w pozostałych przykładach;
- współrzędne ucięte w oryginale („54º 49’…”N 17º 57’…”E”) – przepisane jak są;
- pokrycia na listach gatunków: karta ma opisy, więc gatunki wzięto ze zdjęć, a stopnie B-B (najwyższy z trzech zdjęć) zamieniono na środki przedziałów (+ 0,5; 1 2,5; 2 15; 3 37,5; 4 62,5; 5 87,5);
- obce ekologicznie: XX z opisem (brak w karcie, poza oceną);
- oddziaływanie „U – nieznane” ma w karcie wpływ i intensywność „x” – tabela tego nie przyjmuje, więc wpis jest w uwagach; zagrożenia „Brak” → kod X;
- zdjęcie III: „Warstwa B: +” bez nazwy gatunku – warstwa B pusta, adnotacja w uwagach;
- data 19.10 jest poza oknem czerwiec–wrzesień – formularz ostrzega (zgodnie z metodyką).
