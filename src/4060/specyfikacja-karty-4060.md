# Specyfikacja karty 4060 – Wysokogórskie borówczyska bażynowe (Empetro-Vaccinietum)

Formularz karty obserwacji wg przewodnika GIOŚ (Świerkosz 2012, cz. II, s. 247–256, tab. 1 i 2, przykładowa karta
„Kopa”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016 i 2021. Siedlisko nieleśne, niepriorytetowe,
regiony alpejski i kontynentalny. Silnik wspólny (`src/7120`) – **bez zmian**, `structureRule` nieużywane (reguła ogólna).
Z `src/forest` tylko generyczne klocki. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: płaty rozproszone, transekt zwykle niestandardowy (domyślnie „Niestandardowy na skutek rozproszenia płatów
siedliska”), trzy punkty współrzędnych (wymagany pierwszy). Zdjęcia: 3 (jak w karcie), domyślnie 10 m² (metodyka:
min. 10 m², na półkach skalnych 3–4 m²), warstwy B, C, D. Termin: koniec czerwca – połowa sierpnia (ostrzeżenie poza
20.06–15.08), cykl 3–6 lat. Dodatkowe pola: typ stanowiska, zarządzający terenem, udział powierzchni FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha + opis | z selecta (spadek ≤5% U1, >5% U2) |
| **Gatunki charakterystyczne** | lista z pokryciem + łącznie wprost + opis | suma wyznaczników: >5 FV, 2–5 U1, <2 U2 |
| **Gatunki dominujące, w tym ekspansja borówki czarnej** | lista z pokryciem + udział wprost + „brak dominanta” + opis | największy dominant spoza wyznaczników: <50 FV, 50–70 U1, >70 U2 |
| Ekspansja kosodrzewiny Pinus mugo | pokrycie % + lista krzewów + opis | ≤30 FV, ≤50 U1, >50 U2 |
| **Zniszczenia mechaniczne** | select + opis | z selecta |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Gatunki charakterystyczne – co się liczy.** Tab. 1 odsyła do listy „typowych gatunków” z rozdz. 4, na której są też
  borówka czarna i brusznica – liczone razem dawałyby FV prawie zawsze. Sprawozdanie 2016 krytykuje taką interpretację,
  a 2021 oceniało obecność i pokrycie wyznaczników zespołu. Formularz sumuje więc tylko: bażynę obupłciową (z synonimem
  E. nigrum subsp. hermaphroditum), borówkę halną (V. gaultherioides, V. uliginosum subsp. microphyllum/gaultherioides),
  a dla postaci z Gór Stołowych – bażynę czarną i borówkę bagienną (tak w 2021). Łączne pokrycie wpisane wprost ma
  pierwszeństwo. Ostrzeżenie przy braku bażyny albo borówki halnej (na Babiej Górze borówki halnej nie ma – to norma).
- **Granice:** 5% → U1 (FV dopiero „>5%”), 2% → U1; dominanci 50% i 70% → U1; kosodrzewina 30% → FV
  („nie większy niż 30%”), 50% → U1.
- **Gatunki dominujące – czego udział.** Tab. 2 podaje same progi procentowe. Przyjęto udział największego pojedynczego
  dominanta spoza wyznaczników zespołu (dominacja bażyny czy borówki halnej nie obniża oceny – sprawozdanie 2021:
  Masyw Pilska, Kopa → FV). Tak wychodzi karta z przewodnika („brak gatunku dominującego z udziałem powyżej 30%”). Gdy
  borówka czarna z brusznicą łącznie dają inną klasę, formularz ostrzega (2021, Gówniak 01: „obie borówki 90%” → U2) –
  łączną ocenę wpisuje się jako udział wprost.
- **Brak osobnej „ekspansji borówki czarnej”.** Sprawozdania 2016 i 2021 oceniały ją dodatkowo jako piąty wskaźnik;
  metodyka 2012 włącza ją do „gatunków dominujących”, więc karta trzyma się tab. 2 (opis w pomocy wskaźnika).
- **Kosodrzewina a inne krzewy.** Gdzie kosówki nie ma, w 2021 oceniano pokrycie innych krzewów (Wetlina: jarząb ok. 5% → FV)
  – pomoc to opisuje, liczba idzie do tego samego pola.
- **Ocena ogólna.** Tab. 2 podaje regułę z 2012 r. („wszystkie FV lub dwa FV i jeden U1” → FV). Silnik liczy wg zasady
  „najgorszy decyduje” (jak w pozostałych kartach, praktyka od 2016). Na przykładzie Kopa nie ma różnicy – wszystko FV.
  Struktura liczona regułą ogólną silnika (kardynalny U2 → U2, wszystkie kardynalne FV i brak U2 → FV, reszta U1).

## Przykład „Kopa” (Karkonosze, 24.08.2011) – zgodny z oryginałem
Wszystkie wskaźniki FV, powierzchnia FV, struktura FV, perspektywy FV, ocena ogólna FV – jak w karcie; podpowiedzi
formularza zgodne z ekspertem, bez ostrzeżeń. Przeliczenia przedziałów z karty na liczby:
- bażyna obupłciowa „2–5%” → 5, borówka halna „sporadycznie” → 0,5; razem 5,5% → FV, zgodnie z opisem karty („z udziałem
  powyżej 5%”). Przy dolnych końcach przedziałów (2 + 0,5) wyszłoby U1 – karta sama mówi „powyżej 5%”, więc górne końce;
- wrzos „20–30%” → 30, borówka czarna „10–30%” → 30; największy 30% → FV;
- kosodrzewina „pojedyncze siewki” → 0,5% → FV.
Inne: obserwatorzy i koordynatorzy zanonimizowani (Jan Kowalski); współrzędne ucięte w przewodniku do minut; literówka
„Calamagrostis villlosa” poprawiona; siewki kosówki, wierzba śląska i jarząb w warstwie C, jak w karcie; termin 24.08 –
formularz ostrzega, że to kilka dni po oknie metodyki (karta z przewodnika tego nie zaznacza).
