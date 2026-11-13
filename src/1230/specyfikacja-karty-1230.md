# Specyfikacja karty 1230 – Klify na wybrzeżu Bałtyku

Formularz karty obserwacji wg przewodnika GIOŚ (Łabuz 2012, cz. II, s. 40–58, tab. 1 i 2) z praktyką oceny
ze sprawozdań z monitoringu 2011, 2017 i 2023. Silnik wspólny (`src/7120`) – bez zmian. Z `src/forest` tylko klocki
generyczne (`choiceIndicator`, `measureIndicator`, `pickField`, `labelOf`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: odcinek 100–300 m wzdłuż brzegu, od krawędzi do podnóża. Pola dodatkowe: kilometraż brzegu, budowa
geologiczna, wysokość krawędzi, co jest u podnóża (plaża / platforma abrazyjna / nic).
Zdjęcia fitosocjologiczne: domyślnie 0 – przewodnik ich nie wymaga. Zamiast tego zakładka **Profil klifu**
(azymut, współrzędne podnóża, pomiary profilu, tabela zasięgów gatunków od–do w metrach, dane hydrometeo).
Termin: lipiec–październik (ostrzeżenie poza).

## Wskaźniki (wszystkie struktury kardynalne – patrz niżej)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia | select trendu | nie maleje FV, maleje U1, wyraźnie maleje U2, brak danych XX |
| Stabilność ściany | % powierzchni aktywnej + stan (opis) | <25 U2, 25–50 FV, >50–75 U1, >75 U2 |
| Nachylenie | ° | ≤40 FV, ≤50 U1, >50 U2 |
| Tempo cofania | m/rok | ≤0,5 FV, ≤1,5 U1, >1,5 U2 |
| Zjawiska geodynamiczne | osuwiska + wysięki + długość odcinka → na 100 m | ≤1 FV, ≤2 U1, >2 U2 |
| Stan dolnej części | najwyższe podcięcie (m) + charakter | ≤0,5 FV, ≤1,5 U1, >1,5 U2 |
| Rośliny zielne charakterystyczne | select + opcjonalna lista gatunków | z selecta |
| Krzewy / drzewa | select + opcjonalne pokrycie % (ma pierwszeństwo) | krzewy >15/5–15/≤5; drzewa >10/1–10/≤1 |
| Odnowienia | select | liczne FV, pojedyncze U1, brak U2 |
| Liczba gatunków zielnych | liczba; pusto → liczy listę z roślin zielnych | ≥15 FV, 5–14 U1, <5 U2 |
| Pokrycie stoku | % | 30–70 FV; 10–30 i 70–90 U1; reszta U2 |
| Szerokość plaży | m | ≥25 FV, 10–25 U1, <10 U2 (interpretacja) |
| Wysokość plaży | m n.p.m. | ≥2 FV, 1–2 U1, <1 U2 |
| Zasięg napływu morza | select (linia kidziny) | linia wody FV, środek plaży U1, podnóże U2 |

## Interpretacje
- **Kardynalne**: przewodnik 2012 nie wskazuje żadnych. Silnik bez kardynalnych nie umie wystawić U2, więc wszystkie
  14 traktowane są jako równorzędne i kardynalne: jedno U2 → U2, same FV → FV, reszta U1 (decyzja użytkownika: „najogólniej”).
- **Metodyka 2021** (Nowakowski, 12 wskaźników, 7 kardynalnych, nowe: zbiorowiska, gatunki obce, umocnienia brzegu)
  jest znana tylko ze sprawozdania 2023 – to maszynopis, progów brak. Nie implementowana.
- **Stabilność**: przedziały tab. 2 się zazębiają; przyjęto 25–50% aktywnego FV.
- **Szerokość plaży**: brak progów w tab. 2; przyjęto 25 m (średnia z tab. 1) i 10 m (oceny U2 z 2023: 6,5–8,75 m).
- **Wysokość plaży 2 m** → FV (tab. 1: „min. 2 m chroni”), choć tab. 2 pisze „wyższa od 2 m”.
- **Powierzchnia**: przewodnik bez progów, wszystkie stanowiska dotąd FV; opcje wg ogólnych zasad GIOŚ.

## Przykład
Kl1 Rozewie 1, 16.10.2011 (i 25.05.2010), obserwator „Jan Kowalski”. Oceny wskaźników jak w karcie z przewodnika.
Struktura wychodzi **U2** (podcięcia 1–6 m), w przewodniku FV – tam ocena ekspercka. Brakujące liczby: aktywne 40%
(FV), szerokość plaży 12 m z tab. 3 (U1), pokrycie 80% („pomiędzy 30 a 80%”, U1).
