# Specyfikacja karty *2130 – Nadmorskie wydmy szare

Formularz karty obserwacji wg przewodnika GIOŚ (Braun 2010, cz. I, s. 61–72, tab. 1 i 2, przykład karty) z praktyką
oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne,
**priorytetowe** (w karcie `*2130`). Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko
generyczne klocki (`selectInput`, `speciesInput`, `pickField`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: transekt 10×200 m (metodyka dopuszcza zmianę kształtu). Zdjęcia fitosocjologiczne: 3 po 25 m² (5×5 m),
na początku, w środku i na końcu transektu, Braun-Blanquet; warstwy A–D, rośliny zielne w C, porosty i mszaki w D.
Termin: lipiec (optimum wegetacji), ostrzeżenie poza czerwcem–sierpniem. Kontrola co 3 lata.

## Wskaźniki (pogrubione = kardynalne, kursywa = zapisywane, ale poza oceną)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select (+ „brak danych” → XX) + ha + opis | z selecta |
| **Charakterystyczna kombinacja florystyczna** | lista gatunków z % + pokrycie warstwy porostowo-mszystej % + „murawa zniekształcona” | ≥3 gat. i D >50% FV; ≥2 gat. U1; <2 albo zniekształcona U2 |
| *Gatunki dominujące* | lista gatunków ≥10% + klasa ekspercka | z selecta (progi dopowiedziane) |
| Obce gatunki inwazyjne | lista z % + klasa | suma pokryć: 0 FV, <5% U1, ≥5% U2 |
| **Rodzime gatunki ekspansywne roślin zielnych** | lista z % + klasa | suma pokryć: 0 FV, <5% U1, ≥5% U2 |
| **Gatunki nitrofilne** | lista z % + klasa | 0 FV; 1–2 gat. i każdy <5% U1; >2 gat. albo któryś ≥5% U2 |
| **Obecność nalotu drzew** | lista z % + klasa | 0 albo sama sosna <1% FV; suma <5% U1; ≥5% U2 |
| Obecność krzewów i krzewinek | lista z % + klasa | największe pokrycie gatunku: 0 FV, <5% U1, ≥5% U2 |
| *Występowanie procesów eolicznych* | intensywność + % transektu + formy | z selecta (progi dopowiedziane) |
| **Występowanie abrazji** | select + % transektu + formy | z selecta |
| **Zniszczenia mechaniczne** | select + % zniszczonej powierzchni + rodzaj | z selecta |

## Interpretacje i dopowiedzenia
- **Kardynalne**: sześć z listy pod tab. 2 (kombinacja florystyczna, ekspansywne, nalot, nitrofilne, abrazja, zniszczenia).
  Obce inwazyjne i krzewy/krzewinki niekardynalne. Sprawozdanie 2024 narzeka, że to za dużo kardynalnych – ale tak mówi
  metodyka, więc tak liczy formularz.
- **Skala Br.-Bl. → %**: tab. 2 podaje progi w skali Braun-Blanqueta, karta każe wpisywać % transektu. „Najwyżej 1” =
  poniżej 5%, „większy od 1” = od 5% (klasa 2 to 5–25%). Lista z pokryciami ma pierwszeństwo przed wyborem klasy; klasa
  służy, gdy pokryć nie ma. Gdy któremuś gatunkowi brakuje pokrycia – podpowiedź z klasy.
- **Kombinacja florystyczna**: tab. 2 zostawia dziury. Równo 50% warstwy D – U1 (FV wymaga „ponad 50%”).
  ≥3 gatunki przy warstwie ≤50% – U1. Dwa gatunki przy warstwie >50% – U1 (dosłownie „inne kombinacje” = U2, ale lepsza
  warstwa nie może dawać gorszej oceny). Pokrycia warstwy porostowo-mszystej na transekcie karta nie ma – dodane pole.
  Liczone gatunki: z tab. 1 (jasieniec, jastrzębiec baldaszkowaty, fiołek trójbarwny nadmorski, bylica polna nadmorska;
  przechodzące: turzyca piaskowa, piaskownica, szczotlicha) + **kocanki piaskowe** (gatunek nazwy zespołu, w tab. 1 go
  nie ma – dopisany). Odmiany jednego gatunku liczą się raz. Porosty i mchy idą przez pokrycie warstwy D, nie przez liczbę.
- **Piaskownica** jest w tab. 1 i wśród charakterystycznych, i wśród ekspansywnych – katalog ma obie role; formularz nie
  zgaduje, w którym wskaźniku ją wpisano.
- **Nitrofilne**: tab. 2 U1 mówi „r lub 1”, pomija „+” – liczony jak U1. Brak pokryć przy 1–2 gatunkach → podpowiedź z klasy.
- **Nalot drzew**: „pojedyncze siewki sosny” = sama sosna o łącznym pokryciu <1% (r, +). Inne drzewa nawet pojedynczo – U1.
- **Krzewy i krzewinki**: tab. 2 mówi o pokryciu *gatunku*, więc liczy się największe pokrycie jednego gatunku (sprawozdanie
  2024 opisuje sumy – to opis wyników, nie progi).
- **Obce inwazyjne**: lista gatunków ze sprawozdań (tab. 3 z 2024: róża pomarszczona, wierzba ostrolistna, przymiotno
  kanadyjskie, klon jesionolistny, sosna czarna, oliwnik srebrzysty). Przymiotno i starzec wiosenny są też w tab. 1 jako
  nitrofilne – katalog ma obie role.
- **Gatunki dominujące** i **Występowanie procesów eolicznych**: są w przykładowej karcie, nie ma ich w tab. 2, a od 2014
  nie są oceniane (sprawozdanie 2016–2018, pkt 9; 2024: „8 wskaźników”). Formularz je zapisuje (`excluded`), ale nie wlicza
  do struktury. Progi są **dopowiedziane**: procesy eoliczne z wiersza „Perspektywy ochrony” tab. 2 (sporadyczne – U1,
  uruchomione – U2, nieznaczne nawiewanie – FV jak w karcie); dominujące – FV, gdy dominuje murawa i warstwa D, U1/U2, gdy
  wśród dominujących są gatunki ekspansywne, nitrofilne, obce, krzewy, drzewa. Podpowiedź tylko z wyboru eksperta.
- **Powierzchnia**: U1 w tab. 2 to „inne kombinacje” – w selekcie z dopiskiem „np. niewielki spadek powierzchni”.
- **Termin**: metodyka – lipiec. Ostrzeżenie dopiero poza czerwcem–sierpniem, bo badania 2018 i 2024 szły 6.06–6.08
  i sprawozdanie nie widziało wpływu terminu.
- **Ocena struktury**: tab. 2 FV „pozostałe przynajmniej U1”, silnik liczy „żaden pozostały nie U2” – jak w innych kartach.
- **Kody oddziaływań**: lista z 2011 r., jak w sprawozdaniach 2016–2018 (B01, G05.01, K01.01, K02.01, I01, I02, L07…).
  Przykładowa karta (2008) używa starych kodów – przemapowane (niżej).
- **Pozycje karty bez osobnego pola** (typ stanowiska, zarządzający terenem, nazwa obszaru, rok i typ monitoringu,
  koordynator, „monitoring jest wymagany” z uzasadnieniem, udział powierzchni FV/U1/U2) – w „Uwagach”, jak w 2110.

## Przykład
Przebrno/Siekierki (Mierzeja Wiślana), 2.07.2008 i 25.08.2008, wykonawca „Jan Kowalski” (w oryginale koordynator z nazwiska).
Oceny jak w karcie: wszystkie wskaźniki FV → powierzchnia FV, struktura FV, perspektywy FV, ogólna FV. Udział FV 75%,
U1 20%, U2 5% – w uwagach.

Co odbiega od dosłownego tekstu karty:
- współrzędne ucięte w przewodniku do minut – przepisane do minut; jedne dla początku, środka i końca transektu;
- data: pierwszy dzień kontroli, drugi w uwagach;
- „do 5%” → 5, „<1%” → 0,5 w listach (tekst „wartości” zostaje dosłowny);
- pokrycie warstwy porostowo-mszystej na transekcie (nowe pole) – 75%, najniższe ze zdjęć (75–80%);
- **gatunki nitrofilne** (rzeżusznik 10%, szczaw do 5%) i **nalot drzew** (brzoza i dąb <1%, sosna do 5%) są w karcie
  FV, a wg tab. 2 wychodzą U2. Formularz podpowiada U2 („wg progów: U2”), ocena z karty (FV) zostaje – ocena należy do
  eksperta, a przykład ma odpowiadać oryginałowi. Karta pochodzi z 2008 r., sprzed obecnych progów;
- działalność człowieka: 161 „Zalesianie” → B01 „Zalesianie terenów otwartych”, intensywność A → H; 720 „Wydeptywanie,
  nadmierne użytkowanie” → G05.01, C → L; wpływ (w karcie pusty) → „–”. Zagrożenie „Niewłaściwe zabiegi utrwalające
  wydmy” → G05.07 „Niewłaściwie realizowane działania ochronne lub ich brak”;
- zdjęcia: „Festuca ovina s.str.” → Festuca ovina, siewki sosny i dębu „(c)” w warstwie C, mszaki i porosty w D,
  wysokość warstwy D „do 10” → 10 cm.
