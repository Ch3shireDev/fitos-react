# Specyfikacja karty 6520 – Górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie (Polygono-Trisetion i Arrhenatherion)

Formularz karty obserwacji wg przewodnika GIOŚ (Korzeniak 2012 [w:] Mróz (red.), cz. III, s. 95–108, tab. 1 i 2, lista
wskaźników kardynalnych, przykładowa karta „Lasówka”) z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania
2009–2010), 2015–2018 (badania 2017–2018) i 2023–2025 (badania 2024–2025); przy rozjazdach pierwszeństwo ma najnowsze
sprawozdanie. Siedlisko niepriorytetowe, region alpejski (Karpaty) i kontynentalny (Sudety). Silnik wspólny (`src/7120`)
i `src/forest` – **bez zmian**; struktura i ocena ogólna regułą ogólną (bez `structureRule`). Karta rejestruje się sama
przez `meta.ts` – rejestru kart nie dotyka.

Stanowisko: podtyp (tekst, opcjonalny), **region** (Sudety / Karpaty / Pieniny / Tatry – steruje listą gatunków
charakterystycznych), nazwa stanowiska, GUID, nazwa obszaru, formy ochrony, zarządzający, opis, zbiorowiska, powierzchnia
płatów, współrzędne początku, środka i końca transektu, wysokość, wymiary transektu (10 × 200 m albo inny prostokąt
równy 20 arom), data, obserwator, dodatkowi eksperci. Zdjęcia: 3 × 25 m² (oba końce i środek transektu), warstwy B–D,
uwagi do zdjęcia. Termin: 15.06–31.07 bez uwag; 1–14.06 i 1–15.08 ostrzeżenie miękkie („poza optymalnym”); poza
1.06–15.08 ostrzeżenie twarde („poza dopuszczalnym”). Oddziaływania: lista kodów typowych dla łąk (koszenie, wypas,
zaniechanie, nawożenie, zabudowa…). Inne informacje: propozycje działań, „Monitoring jest wymagany” + uzasadnienie,
udział FV/U1/U2.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska (parametr) | select (+ XX) + powierzchnia + opis | stabilna FV, inne kombinacje U1, wyraźny spadek / zanik U2 |
| Procent powierzchni zajęty przez siedlisko na transekcie | % + ocena ekspercka | ≥80 FV, >50–<80 U1, ≤50 U2 |
| **Struktura przestrzenna płatów** | select + wielkość płatów | brak fragmentacji FV, płaty po kilkanaście arów U1, po kilka arów U2 |
| **Gatunki charakterystyczne** | lista + liczba wprost + ocena ekspercka | >5 FV, 3–5 U1, ≤2 U2 |
| Gatunki dominujące | lista z pokryciem + ocena ekspercka | patrz niżej |
| Obce gatunki inwazyjne | lista + łączne pokrycie + „nie stwierdzono” | patrz niżej |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista + łączne pokrycie + „nie stwierdzono” + ocena ekspercka | patrz niżej |
| **Ekspansja krzewów i podrostu drzew** | łączne pokrycie + lista | <1% FV, 1–5% U1, >5% U2 |
| Zachowanie strefy ekotonowej | select + szerokość | brak / bez ekspansywnych FV, umiarkowana ekspansja U1, ekspansja U2 |
| Wojłok | min./maks./średnia z 20 pomiarów + ocena ekspercka | <2 cm FV, 2–5 cm U1, >5 cm U2 |

Kardynalne wg listy pod tab. 2: struktura przestrzenna, gatunki charakterystyczne, ekspansywne, krzewy.

## Rozjazdy metodyki (krótko)
- **Procent powierzchni**: tab. 2 ma luki (powyżej 50 do 60% i powyżej 70 do 80%) – formularz liczy je do U1, jak
  w 2024 r. („50–80% powierzchni transektu – U1”).
- **Gatunki charakterystyczne a regiony**: tab. 1 + gatunki Arrhenatherion (bez typowo niżowych taksonów Arrhenatheretum,
  które są w katalogu jako towarzyszące z flagą „niżowy”) + listy regionalne ze sprawozdań: sudecka, karpacka, pienińska
  i tatrzańska. Gatunki pienińskie i tatrzańskie liczą się tylko przy wybranym regionie; **kostrzewa czerwona** liczy się
  wyłącznie w Sudetach (tak liczono przy Lasówce). Synonimy sprowadzane do jednego klucza (np. starzec Fuchsa → starzec
  jajowaty), żeby jeden gatunek nie liczył się dwa razy.
- **Dziurawiec czteroboczny**: w sprawozdaniach najczęstszy ekspansywny (zwłaszcza w Sudetach), czescy botanicy uznają go
  za diagnostyczny dla Polygono-Trisetion, sprawozdanie 2009–2011 nie umie rozstrzygnąć. Katalog: „sporny” – liczy się jak
  zwykły ekspansywny (nie „silnie”), z wyjaśnieniem w podpowiedzi.
- **Ekspansywne** – tab. 2 liczbowo podaje tylko 10% dla pojedynczego gatunku silnie ekspansywnego. Interpretacja
  formularza: U2 – gatunek silnie ekspansywny (13 z tab. 1) >10% albo łącznie >50% (2016–2018: „zwykle ok. 50% – U2”);
  U1 – silnie ekspansywny >1% albo łącznie >30%; inaczej FV. Pokrycia ≤1% i „+” nie zmieniają oceny. **Próg 30% to
  kalibracja pod kartę przykładową** (dziurawiec 30%, reszta znikomo → FV). Ocena ekspercka ma pierwszeństwo.
- **Gatunki dominujące**: progi tab. 2 są opisowe. Formularz: wśród dominantów (>10%) gatunek silnie ekspansywny, obcy
  albo drzewo/krzew – U2; któryś gatunek spoza charakterystycznych >50% (np. monodominacja mietlicy) – U1; inaczej FV.
  Ubóstwa gatunkowego formularz nie ocenia – od tego jest pole oceny eksperckiej.
- **Obce**: wysoce inwazyjne (rdestowce, niecierpek gruczołowaty, nawłocie, barszcze, łubin trwały, rudbekia, rukiewnik…)
  – pojedyncze osobniki (do 0,5% na gatunek) U1, więcej U2; pozostałe – do 0,5% na gatunek FV, do 5% łącznie U1, >5% U2.
  Gatunek spoza katalogu = słabo inwazyjny. Łubin w praktyce 2024: U1, od ~7% U2; w 2016–2018 przy ~5% dawano U2 –
  formularz idzie za tab. 2 (dokładnie 5% → U1).
- **Ekoton**: sprawozdanie 2016–2018 proponuje wyrzucenie wskaźnika (nakłada się na ekspansywne, krzewy i obce), ale
  w 2024–2025 dalej go oceniano – zostaje, niekardynalny.
- **Wojłok**: na Hali Izerskiej i torfowiskowych łąkach Gór Izerskich grubszy wojłok bywa naturalny – podpowiedź każe
  to opisać; progi bez zmian.
- **Termin**: przewodnik – czerwiec–lipiec, po wykłoszeniu traw i przed pokosem; praktyka 2024–2025 – 1.06–15.08.
  Stąd dwa poziomy ostrzeżeń.
- **Powierzchnia – zanik**: osobna opcja „siedlisko zanikło” (U2), bo w 2024 r. tak oceniano łąki zamienione w pastwiska.

## Przykład – Lasówka (Dzika Orlica), 25.07.2009
Obserwator zanonimizowany („Jan Kowalski”), region Sudety, podtyp „6520-1 Sudecka łąka konietlicowa”. Trzy zdjęcia
(49, 46, 48 gatunków) przepisane z karty, mszaki w warstwie D, głóg „juv. +” w runi. **Wszystkie oceny wskaźników,
parametrów i ocena ogólna jak w karcie**: struktura FV, perspektywy U1, ocena ogólna U1; udział FV/U1/U2 = 40/60/0.

Ekspert w trzech miejscach odszedł od progów tab. 2 – te oceny są wybrane w polu „Ocena” i formularz pokazuje
„odbiega od progów”:
- gatunki charakterystyczne – 5 gatunków (próg: U1), ekspert FV;
- procent powierzchni – 80% (próg: FV), ekspert U1 (sprawozdanie 2016–2018 samo uznało to za zaniżenie);
- wojłok – średnio 1 cm (próg: FV), ekspert U1 (grubszy w płatach ziołoroślowych).

Czwarte ostrzeżenie – gatunki dominujące: mietlica i dziurawiec po 30% przy ocenie FV; formularz zwraca uwagę na
spornego dziurawca wśród dominantów, ocena zostaje ekspercka.

Inne przeniesienia: współrzędne ucięte – do minut; stare kody oddziaływań (2009) → słownik 2011: 102 → A03,
403 → E01.03, 502 → D01.02, 511 → D02.01, intensywność B → M, C → L; zagrożeń karta osobno nie wymienia (planowana
zabudowa siedzi w perspektywach i oddziaływaniach); data wypełnienia i typ monitoringu w uwagach.

## Testy
37 nowych (33 w `habitats/methodology.test.ts` – progi, podpowiedzi, kardynalne, regiony, synonimy, przykład wskaźnik
po wskaźniku, ostrzeżenia dokładnie na percent/characteristic/dominant/litter, eksport docx; 4 w `Card6520.test.tsx` –
nagłówek, przykład z oceną U1, wiersze kardynalne, kafelek na stronie głównej). Całość: 1802/1802 zielone, `tsc -b`
czysto, build OK, oxlint na `src/6520` czysto.
