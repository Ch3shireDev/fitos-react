# Specyfikacja karty 2110 – Inicjalne stadia nadmorskich wydm białych

Formularz karty obserwacji wg przewodnika GIOŚ (Lemke 2015, cz. IV, s. 56–65, tab. 1 i 2) z praktyką oceny ze sprawozdań
z monitoringu 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne, niepriorytetowe.
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: pasowy transekt 200×10 m. Zdjęcia fitosocjologiczne: 3 (co 100 m – początek, środek, koniec), poletka 5×5 m
(25 m²), Braun-Blanquet, prawie wszystko w warstwie C. Termin: czerwiec–październik (ostrzeżenie poza). Kontrola co 3 lata.

## Wskaźniki (pogrubione = kardynalne)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha + opis | z selecta; puste = ocena eksperta |
| Gatunki charakterystyczne | lista z pokryciem % + select + opis | z selecta; ostrzeżenia, gdy lista nie zgadza się z wyborem |
| **Kondycja i forma wzrostu wydmotwórczych gatunków traw** | % transektu z kwitnącymi/owocującymi kępami albo klasa + opis kondycji | ≥10 FV, >0 i <10 U1, 0 U2 |
| **Występowanie sedymentacji/abrazji** | select + opis | z selecta |
| Gatunki obce ekologicznie lub geograficznie | lista + liczba egzemplarzy (kęp) + m² + klasa | 0 FV; 1 egz./kępa ≤1 m² U1; >1 egz. albo >1 m² U2 |
| Zniszczenia mechaniczne | select + opis | z selecta |

## Interpretacje
- **Nazwy**: etykiety z przewodnika 2015. SI MGSP i sprawozdania używają „Występowanie abrazji”, „Gatunki obce geograficznie”,
  „Mechaniczne zniszczenie” – podane w opisach wskaźników.
- **Kardynalne**: tylko kondycja traw i sedymentacja/abrazja (lista pod tab. 2). Gatunki charakterystyczne i zniszczenia są
  niekardynalne, choć sprawozdania o nich dużo piszą – tak mówi metodyka, więc tak liczy formularz.
- **Kondycja traw**: tab. 2 nie przewiduje przypadku „kwitną na 10%, ale sporadycznie” – liczy się procent: od 10% FV.
  Sprawozdanie 2024 opisuje FV przy 20–90% i U1 przy 5–10% – to opis wyników, nie nowe progi; zostają progi z przewodnika.
- **Gatunki obce**: „1 kępa <1 m²” (U1) vs „większą niż 1 m²” (U2) zostawia dziurę na równo 1 m² – liczone do U1.
  Bez liczby egzemplarzy formularz liczy z listy: 2+ gatunki to co najmniej 2 egzemplarze → U2. Obce ekologicznie
  (rodzime krzewy sadzone przez Urząd Morski – wierzba wawrzynkowa, rokitnik) liczą się tak samo jak obce geograficznie.
- **Gatunki charakterystyczne**: 5 z tab. 1 (honkenia, rukwiel, piaskownica, wydmuchrzyca, perz sitowy) z synonimami
  (Elymus arenarius, Elymus farctus, Elytrigia juncea). Kostrzewa kosmata i trzcinnikownica bałtycka (wymieniane w
  sprawozdaniu 2024) są w katalogu jako towarzyszące trawy wydmotwórcze – do oceny gatunków się nie liczą.
  Tab. 2 nie podaje progów liczbowych, więc ocena z selecta.
- **Ocena struktury**: tab. 2 mówi „pozostałe w większości przynajmniej U1”, silnik liczy „żaden pozostały nie U2” – jak w innych kartach.
- **Kody oddziaływań**: stara lista (2011), jak w sprawozdaniach 2013–2018 i w przykładowej karcie.

## Przykład
Świnoujście, 12.10.2013, wykonawca „Jan Kowalski”. Oceny jak w karcie: wszystkie wskaźniki FV poza zniszczeniami
mechanicznymi U1 (niekardynalne) → struktura FV, perspektywy FV, ogólna FV. Współrzędne w przewodniku są ucięte do minut –
przepisane do minut. Wartości wskaźników przepisane jako opisy (karta nie podaje procentów). Intensywność oddziaływań A → H.
