# Specyfikacja karty 3240 – Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków

Formularz karty obserwacji wg przewodnika GIOŚ (Perzanowska 2012, cz. II, s. 193–203, tab. 1 i 2, przykładowa karta
Śnietnica) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021. Siedlisko zaroślowe, niepriorytetowe,
głównie region alpejski. Silnik wspólny (`src/7120`) i `src/forest` – **bez zmian** (z `src/forest` tylko generyczne klocki:
`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`, `gradeMap`, `plNum`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: odcinek koryta 0,5–1 km; transekt 200×10 m (ostrzeżenie, gdy nie 2000 m²). Zdjęcia: 3 × 25 m² (początek, środek,
koniec transektu), Braun-Blanquet, warstwy B i C. Termin: czerwiec–sierpień (ostrzeżenie poza oknem; 2016 badano we wrześniu).
Powtarzanie co 6 lat.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select trendu (+ „brak danych” → XX) + powierzchnia tekstem + opis | z selecta; % na transekcie jako wskazówka |
| Powierzchnia zajęta przez siedlisko na transekcie | % + opis | >25 FV, 10–25 U1, <10 U2 |
| **Gatunki krzewów** | lista z pokryciem + września w sąsiedztwie + ocena ekspercka + opis | brak wierzby siwej U2; siwa <10% albo września brak/<1% U1; inaczej FV |
| Wysokość krzewów (średnia) | liczba albo zakres (m) + max + opis | 1,5–3 FV, 0,5–<1,5 U1, <0,5 lub >3 U2 (środek zakresu) |
| Zwarcie krzewów na transekcie | liczba albo zakres (%) + opis | >30 FV, 10–30 U1, <10 U2 |
| Struktura przestrzenna płatów zarośli | select + opis | z selecta |
| **Udział gatunków drzewiastych (powyżej 3 m wys.)** | select klasy + lista + opis | z selecta |
| Stan zdrowotny krzewów wierzbowych | select + opis | z selecta |
| Odnowienie wierzby (obecność nalotu) | select + opis | z selecta |
| Gatunki ekspansywnych roślin zielnych | lista + „nie stwierdzono” + ocena + opis | z oceny; „nie stwierdzono” → FV |
| **Obce gatunki inwazyjne** | lista z pokryciem + liczebność + liczba wprost + „nie stwierdzono” | 0 FV; 1 gat. pojedynczo FV, w kępach U1; 2 gat. U1; ≥3 albo łanowo U2 |
| **Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0** | 4 selecty (dobrze / słabo / brak) + opis | ≥3 dobrze wykształcone FV; ≥2 obecne U1; ≤1 U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Parametr „Powierzchnia siedliska”**: tab. 2 ma pierwszy wiersz „Powierzchnia kamieńców na transekcie” przed nagłówkiem
  struktury, z progami mieszającymi trend i ary/procenty. Karta przykładowa ma osobno „Powierzchnia siedliska <0,5 ha FV”
  (parametr) i „Powierzchnia zajęta przez siedlisko na transekcie 50% FV” (struktura). Formularz: parametr = trend (select),
  a progi procentowe (>25 / 10–25 / <10%) użyte dla wskaźnika na transekcie; przy parametrze pokazywane tylko jako wskazówka.
- **Zestaw wskaźników**: przewodnik i monitoring 2010/2016 – 11 wskaźników struktury; harmonizacja w sprawozdaniu 2016–2018
  i monitoring 2021 – 10 (bez udziału na transekcie). Pole „Zestaw wskaźników struktury” w Stanowisku (domyślnie przewodnik).
  W zestawie „po harmonizacji” wskaźnik zostaje w karcie, ale silnik go pomija (`excluded` – istniejący mechanizm z 91E0).
- **Granice**: udział 10% i 25% → U1; wysokość 1,5 i 3 m → FV, 0,5 m → U1; zwarcie 30% → U1 (sprawozdanie 2021: „25–30%,
  co zgodnie z metodyką wymagało oceny U1”), 10% → U1.
- **Zakresy**: karta podaje wysokość „1,5–2 m” i zwarcie „śr. 40–90%” – pola przyjmują zakres, podpowiedź liczona ze środka.
- **Gatunki krzewów – liczby**: tab. 2 nie podaje progów „niskiego udziału” ani „sporadycznie”. Formularz: wierzba siwa <10%
  transektu = niski udział, września <1% = sporadyczna; liczna września w sąsiedztwie (pole) wystarcza do FV. Brak wierzby siwej
  → U2 (tab. 2 dodaje „tam, gdzie wcześniej występowała” – stąd pole oceny eksperckiej z pierwszeństwem przed listą).
- **Drzewiaste – próg wysokości**: tab. 1 „2,5–3 m”, karta i monitoring 2010/2016 „1,5 m”, tab. 2, lista kardynalnych
  i harmonizacja „3 m”. Formularz: 3 m.
- **Ekspansywne**: tab. 2 opisowa, bez progów pokrycia – ocena wybierana. Ostrzeżenie przy FV i >1 gatunku (karta przykładowa
  ma FV przy lepiężniku 5% i jeżynie 5% – ostrzeżenie się pojawia, ocena zostaje). Lepiężniki i podbiał to gatunki typowe runa.
- **Obce – liczebność**: bez wyboru liczona z pokrycia: <1% pojedynczo, ≥1% kępy, ≥25% łanowo (U2; sprawozdanie 2021: U2
  przy zwarciu inwazyjnych ~30%). Synonimy (Conyza/Erigeron canadensis) liczone raz.
- **Kompleks siedlisk**: liczy się też samo 3240. „Przynajmniej jeden dobrze wykształcony” w U1 poluzowane – dwa typy słabo
  wykształcone też U1 (sprawozdanie 2021: „2–3 typy o niskiej reprezentatywności” → U1), bo inaczej nie mieszczą się w żadnej klasie.
- **Ocena struktury**: jak w innych kartach – FV, gdy kardynalne FV i żaden pozostały nie U2.
- **Udział powierzchni FV/U1/U2** (karta: przy ocenie ogólnej) – trzy liczby w „Innych informacjach”, jak w 2330.
- **Kody oddziaływań**: słownik 2011 (jak w sprawozdaniach 2016–2018), m.in. J02.03.02, L08, C01.01, I01, K02.

## Przykład – Śnietnica (Biała Tarnowska), 21.07.2010
Ekspert zanonimizowany („Jan Kowalski”). Oceny wskaźników jak w karcie: powierzchnia FV (trend nie podany → „nie podlega
zmianom”), udział 50% FV, gatunki krzewów FV (siwa 65%, września 3%), wysokość 1,5–2 m FV, zwarcie 40–90% FV, struktura U1,
drzewiaste FV („Brak”), zdrowie FV, odnowienie FV, ekspansywne FV (wybrane), obce U1 (rdestowiec <1% + barszcz „obok” =
2 gatunki), kompleks FV, perspektywy FV. Udział FV 70%, U1 30%, U2 0%.

**Rozbieżność z oryginałem**: karta podaje strukturę **FV** i ocenę ogólną **FV**, ale kardynalny wskaźnik „Obce gatunki
inwazyjne” ma w niej U1, a reguła tab. 2 („wszystkie kardynalne FV”) daje wtedy strukturę **U1**, czyli ogólną **U1**.
Formularz liczy wg tab. 2 → struktura U1, ogólna U1. To błąd (albo cicha ekspercka korekta) w karcie przykładowej, nie
w formularzu; ekspert może opisać to w komentarzu do oceny ogólnej. Test `methodology.test.ts` pokazuje, że przy obcych FV
wynik byłby identyczny z kartą.

Inne przeniesienia: współrzędne ucięte w przewodniku – do minut; nachylenie „<1” → 0; wysokość warstwy B „150–200 cm” → 1,75 m,
„100 cm, max 2,5 m” → 1 m, „300 cm, max 400–500 cm” → 3 m. Oddziaływania: 830 Regulowanie koryt → J02.03.02, 941 Powódź → L08;
intensywność A → H, stary kod w opisie. „Zagrożenia” (w karcie tekst) → kody L08, I01, J02.03.02, E03, K02 z oryginalną treścią.
Rok, typ monitoringu, „monitoring wymagany – tak” i uzasadnienie – w uwagach.
