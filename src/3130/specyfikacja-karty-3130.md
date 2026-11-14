# Specyfikacja karty 3130 – Brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea, Isoëto-Nanojuncetea

Formularz karty obserwacji wg przewodnika GIOŚ (Zalewska-Gałosz 2015, cz. IV, s. 106–119, tab. 1 i 2, przykładowa karta
Przeborek) z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 i 2023–2025. Siedlisko nieleśne,
niepriorytetowe, regiony kontynentalny i alpejski. Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` tylko
generyczne klocki (`selectInput`, `speciesInput`, `pickField`, `labelOf`, `byOption`). Karta rejestruje się sama przez `meta.ts`.

Stanowisko: podtyp (3130-1 brzegi naturalnych zbiorników / 3130-2 dna osuszanych stawów i zbiorników zaporowych – podział
ze sprawozdania 2013–2014), **klasa zbiorowisk** (Isoëto-Nanojuncetea / Littorelletea / mozaika – od niej zależą progi gatunków
charakterystycznych), typ stanowiska, obszar Natura 2000, zarządzający, dodatkowi eksperci. Transekt 50–150 m (ostrzeżenie poza
zakresem; opis płatów bez długości – bez ostrzeżenia). Zdjęcia: 3 × 1 m² (2 m² dla Littorelletea – w pomocy, pole nie wie o klasie).
Termin: ostrzeżenie poza 1.06–31.10 (okno ze sprawozdania 2023–2025); optimum wg podtypu w pomocy.

## Wskaźniki (pogrubione = kardynalne, wg listy pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ XX) + ha + opis | z selecta (spadek do 20% U1, >20% U2) |
| Powierzchnia zajęta przez siedlisko na transekcie | % + opis | **brak** – pomocniczy, poza oceną (`excluded`) |
| Struktura przestrzenna płatów | stopień (brak/mały/średni/duży) + przyczyna (naturalna/antropogeniczna) | patrz niżej |
| **Gatunki charakterystyczne** | lista + liczba wprost + opis | Isoëto/mozaika: >3 FV, 2–3 U1, ≤1 U2; Littorelletea: ≥2 FV, 1 U1 |
| **Gatunki dominujące** | lista z pokryciem + „brak dominantów” | same typowe FV; część albo brak dominantów U1; żadnego typowego U2 |
| Gatunki ekspansywne roślin zielnych | lista z pokryciem + łącznie wprost + „nie stwierdzono” | ≤25 FV, ≤50 U1, >50 U2 |
| Obce gatunki inwazyjne | lista z pokryciem + łącznie wprost + „nie stwierdzono” | ≤25 FV, ≤50 U1, >50 U2; Spiraea tomentosa → U2 |
| **Udział dobrze zachowanych płatów** | % | >80 FV, 50–80 U1, <50 U2 |

## Interpretacje (dopowiedzenia poza literą metodyki)
- **Powierzchnia na transekcie**: jest w karcie z przewodnika (100% → FV), ale nie ma jej w tab. 2 ani w zestawieniach sprawozdań
  (tam 6 wskaźników struktury). Formularz ją zbiera i pozwala ręcznie ocenić, ale nie wlicza do oceny struktury i nie podpowiada.
- **Struktura przestrzenna**: tab. 2 opisuje tylko brak/małą (FV) i dużą fragmentację (naturalna U1, antropogeniczna U2).
  Średnia → U1 (sprawozdania 2013–2014 „średni stopień” i 2023–2025 „umiarkowany” → U1). Mała antropogeniczna → U1.
  Duża bez podanej przyczyny → brak podpowiedzi + ostrzeżenie.
- **Gatunki charakterystyczne, Littorelletea**: „FV … (w przypadku Littorelletea 2 gatunki)” czytane jako ≥2; „U2 nie dotyczy
  Littorelletea” → 1 gatunek to U1. Zero gatunków to U2 w każdej klasie (brak siedliska). **Mozaika obu klas** (jak w przykładzie)
  → progi Isoëto-Nanojuncetea (ostrzejsze). Bez wybranej klasy – też progi Isoëto, z dopiskiem w wyjaśnieniu.
- **Liczenie gatunków**: rzęśle (Callitriche, dowolny gatunek, także literówka „Calitriche”) i włosieniczniki (Batrachium) to po
  jednym gatunku – tab. 1 wymienia je zbiorczo. Synonimy (Peplis/Lythrum portula, Gnaphalium uliginosum/Filaginella uliginosa,
  Cyperus flavescens/Pycreus…) liczone raz. Mchy, wątrobowce, glewiki i glon z tab. 1 się liczą.
- **Gatunki dominujące**: za typowe dominanty uznane gatunki charakterystyczne i formy lądowe gatunków wodnych (tab. 1:
  „lokalnie dominować mogą … formy lądowe gatunków występujących w wodnych zbiorowiskach sąsiadujących”) – w katalogu jako grupa
  „aquatic” (rdestnica trawiasta, rdest ziemnowodny, przęstka, lobelia, poryblin…). Gatunek spoza katalogu = nietypowy (ostrzeżenie).
- **Granice**: ekspansywne „do 25%” FV i „od 25 do 50%” U1 → 25% to FV, 50% to U1. Obce „nie więcej niż 25%” FV → 25 FV, 50 U1.
  Udział dobrze zachowanych „więcej niż 80%” FV, „mniej niż 50%” U2 → 80% i 50% to U1.
- **Obce**: liczy się każdy gatunek obcy (także Lindernia dubia i Veronica peregrina, które wg tab. 1 nie są „inwazyjne”, ale
  progi tab. 2 mówią o „gatunkach obcych”). Tawuła kutnerowata – U2 niezależnie od pokrycia.
- **Ekspansywne**: tab. 1 + gatunki wskazywane w sprawozdaniach (rdest ostrogorzki, szczaw nadmorski, jeżogłówka, sity, turzyce,
  manna mielec, mietlica rozłogowa, śmiałek, nalot olszy) – w katalogu z dopiskiem „(sprawozdania)”. Nalot wierzb: każda nazwa Salix.
- **Siedlisko niewykształcone**: wskaźniki struktury → XX ręcznie (praktyka 2015–2018 i 2023–2025), struktura wychodzi XX;
  powierzchnia – opcja „brak danych / nie wykształciło się” (XX) albo U2 ręcznie, opisane w pomocy.
- **Udział powierzchni FV/U1/U2**: karta ma go przy ocenie ogólnej; jak w 2330 trafia do „Innych informacji” (trzy liczby).
- **Pola „Raportu rocznego”** (rok, data kontroli, zagrożenia opisowe, monitoring wymagany + uzasadnienie, inne obserwacje,
  uwagi metodyczne i dodatkowe) – do „Uwag”; propozycje działań – osobne pole jak w 40A0.
- **Kody oddziaływań**: słownik 2011 (jak w karcie i sprawozdaniach 2013–2018). Sprawozdanie 2023–2025 używa nowej klasyfikacji
  grup A–X; jej tu nie ma, jak w pozostałych kartach.

## Przykład
Przeborek (staw w kompleksie Brzeszcze), 21.10.2013. Osoby zanonimizowane: ekspert lokalny „Jan Kowalski”, dodatkowy ekspert
„Anna Nowak”, zarządzający „Gospodarstwo rybackie” (w oryginale imię i nazwisko właściciela). **Wynik identyczny z oryginałem**:
wszystkie wskaźniki FV, struktura FV, perspektywy FV, ogólna FV; podpowiedzi zgodne z ekspertem w każdym wskaźniku, bez ostrzeżeń.
Gatunki charakterystyczne: 9 z tab. 1 (babka „wielonasienna” w karcie = Plantago intermedia z tab. 1). Klasa: mozaika.
Dopowiedzenia: współrzędne ucięte w przewodniku – do minut; „<5%” babki zapisane jako 5 (opis jak w karcie);
„Calitriche”, „aciularis” w zdjęciach poprawione; F01 intensywność A → H (stara litera w opisie); zagrożenia „nie stwierdzono,
potencjalnie zaniechanie gospodarki rybackiej” – w uwagach (lista zagrożeń pusta, żeby nie wymyślać kodu); obie „Inne wartości
przyrodnicze” z karty (raport roczny i inne informacje) złączone w jedno pole; udział FV 100 / U1 0 / U2 0.
