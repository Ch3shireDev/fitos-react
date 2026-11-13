# Specyfikacja karty 2120 – Nadmorskie wydmy białe (Elymo-Ammophiletum)

Formularz karty obserwacji wg przewodnika GIOŚ (Lemke 2015, cz. IV, s. 66–74, tab. 1 i 2) z praktyką oceny ze sprawozdań
z monitoringu 2013–2014, 2016–2018 i 2023–2025. Siedlisko nadmorskie, nieleśne, niepriorytetowe.
Silnik wspólny (`src/7120`) – **bez zmian**. Z `src/forest` brane są tylko generyczne klocki (`selectInput`, `speciesInput`,
`pickField`, `labelOf`) – nic leśnego. Karta rejestruje się sama przez `meta.ts`.

Stanowisko: pasowy transekt 200×10 m. Zdjęcia fitosocjologiczne: 3 (co 100 m – początek, środek, koniec), poletka 5×5 m
(25 m²), Braun-Blanquet; warstwa C, a nasadzenia krzewów w B (zwarcie i wysokość B i C). Termin: czerwiec–październik
(ostrzeżenie poza). Kontrola co 3 lata.

## Wskaźniki (pogrubione = kardynalne, lista pod tab. 2)
| Wskaźnik | Dane | Podpowiedź |
|---|---|---|
| Powierzchnia siedliska | select trendu (+ „brak danych” → XX) + ha + opis | z selecta; puste = ocena eksperta |
| Gatunki charakterystyczne | lista z pokryciem % + select + opis | z selecta; ostrzeżenia, gdy lista nie zgadza się z wyborem |
| **Gatunki nitrofilne** | lista + najwyższa ilościowość B-B (r/+ albo ≥1) + klasa | 0 FV; 1 gatunek r/+ U1; 1 gatunek ≥1 albo >1 gatunek U2 |
| **Kondycja i kwitnięcie/owocowanie gatunków traw** | % transektu z kwitnącymi/owocującymi kępami albo klasa + opis | ≥10 FV, >0 i <10 U1, 0 U2 |
| Gatunki obce ekologicznie lub geograficznie | lista + klasa orientacyjna | **pomocniczy** (`excluded`) – nie liczy się do oceny |
| **Występowanie sedymentacji/abrazji** | select + opis | z selecta |
| **Zniszczenia mechaniczne** | select + opis | z selecta |

## Dopowiedzenia (czego brak w metodyce, rozstrzygnięte raportami)
- **Kondycja traw a przykład z przewodnika.** Lista pod tab. 2 czyni kondycję traw kardynalną, a przykładowa karta
  (Jezioro Wicko, 28.09.2013) ma kondycję U1 i mimo to strukturę FV – wbrew własnej regule. Sprawozdanie 2016–2018
  wyjaśnia: U1 na Wicku to skutek późnego terminu badań, a ocena struktury FV została w bazie (Wicko i Mewia Łacha – jedyne
  FV w 2013–2014). Sprawozdanie 2013–2014 proponowało w ogóle odebrać temu wskaźnikowi status kardynalnego.
  Rozwiązanie bez ruszania silnika: pole stanowiska **„Kondycja traw w ocenie struktury”** – domyślnie „Kardynalny
  (metodyka)”, opcjonalnie „Niekardynalny – późny termin” (ocena ekspercka, z ostrzeżeniem „uzasadnij w uwagach”).
  `cardinal` wskaźnika to funkcja tego pola. Przykład ma ustawione „późny termin”; bez tego ta sama karta daje U1 (test).
- **Gatunki obce**: tab. 1 je opisuje, ale tab. 2 nie daje progów i nie ma ich na liście kardynalnych; sprawozdania oceniają
  strukturę 5 wskaźnikami bez nich. Formularz zbiera listę (wartość w karcie), klasa jest orientacyjna (brak / pojedyncze /
  liczne – dopowiedzenie karty), wskaźnik pomijany w ocenie struktury. W przykładzie przepisane ze zdjęć i oddziaływań karty
  z przewodnika: Salix acutifolia (zdjęcie III, B 3), Pinus nigra (zdjęcie II, r) – orientacyjnie U2, bez wpływu na ocenę.
- **Gatunki nitrofilne**: tab. 2 („maksymalnie jeden gatunek o stopniu pokrycia r lub +” / „jeden gatunek przynajmniej 1
  lub więcej niż jeden gatunek”) przełożone na liczbę różnych nazw na liście + najwyższą ilościowość. Jeden gatunek bez
  ilościowości → brak podpowiedzi (prośba o ilościowość). Katalog oznacza jako nitrofilne gatunki o N 7–9 wg Ellenberga
  (m.in. Cirsium vulgare, Sisymbrium officinale – oba ze sprawozdań). Gatunki, które sprawozdanie 2024 liczyło tu, choć
  mają niższe N (Oenothera biennis), nie są oznaczone – ostrzeżenie „sprawdź liczbę Ellenberga”, ocena i tak liczy listę.
- **Gatunki charakterystyczne**: 8 z tab. 1 (piaskownica, wydmuchrzyca, trzcinnikownica, kostrzewa kosmata, groszek
  nadmorski, turzyca piaskowa, lnica wonna, mikołajek) z synonimami (Elymus arenarius, Ammocalamagrostis baltica,
  Festuca rubra subsp. arenaria, Lathyrus maritimus, Linaria loeselii). Honkenia i rukwiel to 2110 – tu towarzyszące.
  Tab. 2 nie podaje progów liczbowych, więc ocena z selecta.
- **Ocena struktury**: tab. 2 mówi „pozostałe w większości przynajmniej U1”; jest tylko jeden niekardynalny (sprawozdanie
  2016–2018 to zauważa), silnik liczy „żaden pozostały nie U2” – to samo.
- **Nazwy**: etykiety z przewodnika 2015. SI MGSP używa „Występowanie abrazji” i „Mechaniczne zniszczenie” – w opisach.
- **Kody oddziaływań**: stara lista (2011), jak w sprawozdaniach 2013–2018 i w przykładowej karcie.

## Przykład
Jezioro Wicko, 28.09.2013, wykonawca „Jan Kowalski” (zanonimizowany). Oceny jak w karcie: powierzchnia FV, gatunki
charakterystyczne FV, nitrofilne FV, kondycja traw U1, abrazja FV, zniszczenia FV → struktura FV, perspektywy FV,
ogólna FV. Współrzędne w przewodniku są ucięte do minut – przepisane do minut. Zdjęcia I–III jak w karcie (III z
warstwą B: Salix acutifolia 3, 40%, 2 m). Typ stanowiska, zarządzający, uzasadnienie monitoringu i udział FV 100% – w
uwagach. Intensywność oddziaływań A → H.
