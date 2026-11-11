# Karta 7120: specyfikacja formularza

Stan na 2026-11-11. Spisuje decyzje podjęte do tej pory w wątku o karcie 7120.

## 1. Cel i zakres

Karta 7120 to wypełnialny formularz karty obserwacji siedliska 7120 (torfowiska wysokie zdegradowane, zdolne do regeneracji) w aplikacji FITOS. Zastępuje zaślepkę `Card7120 = () => <h1>Karta 7120</h1>`.

- **Źródła:**
  - przewodnik metodyczny GIOŚ dla 7120 (skan PDF, czytany z obrazów stron),
  - karta obserwacji w docx, która jest wzorem układu i przykładowym wypełnieniem.
- **Stos:** Vite, React, TypeScript, React Router 7 (HashRouter), Vitest z happy-dom i Testing Library, CSS na zmiennych z `light-dark()`, hosting na GitHub Pages.
- **Zależności:** react-hook-form, zod, @hookform/resolvers oraz `docx` (eksport do Worda, ładowany dopiero po kliknięciu).
- **Dostarczanie:** repozytorium nie jest podpięte. Kod idzie jako paczka `karta-7120.zip` z katalogiem `src/`, którą autor przenosi do projektu ręcznie.

## 2. Architektura

Metodyka jest danymi, a formularz generuje się z niej. Kolejne siedlisko to nowy katalog `habitats/<kod>/`, a nie nowy komponent.

- Logika ocen to czyste funkcje bez Reacta, testowane bez renderowania.
- Stan formularza obsługuje react-hook-form. Walidację robi zod 4 ze schematem budowanym dynamicznie z metodyki.
- `Card7120.tsx` to jedna linia: `<HabitatCardForm methodology={methodology7120} examples={examples7120} />`.

| Plik | Rola |
| --- | --- |
| `habitats/types.ts` | Typy: rodzaje pól, wskaźniki, metodyka, wartości karty, oceny FV/U1/U2/XX |
| `habitats/assessment.ts` | Liczenie ocen, agregacja parametrów i oceny ogólnej, puste wartości startowe |
| `habitats/schema.ts` | Schemat zod generowany z metodyki, komunikaty po polsku |
| `habitats/7120/methodology.ts` | Pola, wskaźniki, progi, wyjaśnienia i kody oddziaływań dla 7120 |
| `habitats/7120/species.ts` | Katalog ok. 77 gatunków z grupami i warstwami |
| `habitats/7120/examples.ts` | Dwa przykłady z karty docx, zanonimizowane |
| `components/habitat-form/HabitatCardForm.tsx` | Zakładki, widok „Całość”, pasek narzędzi, zapis |
| `components/habitat-form/StatusTable.tsx` | Tabela stanu ochrony jak w karcie |
| `components/habitat-form/steps.tsx` | Sekcje: stanowisko, zdjęcia fitosocjologiczne, oddziaływania, zagrożenia, inne |
| `components/habitat-form/fields.tsx` | Generyczne pola, układ wiersz/floating label, listy gatunków, wybór oceny |
| `components/habitat-form/SpeciesCombobox.tsx` | Przeszukiwalny wybór gatunku |
| `components/habitat-form/photos.tsx`, `images.ts` | Wgrywanie i zmniejszanie zdjęć |
| `components/habitat-form/help.tsx` | Przyciski „?”, dymki z wyjaśnieniami, tryb dla początkujących, teksty wspólne |
| `components/habitat-form/inputs.tsx`, `habitats/dates.ts` | Rosnące pola tekstowe, data DD.MM.RRRR |
| `components/habitat-form/exportDocx.ts` | Eksport karty do Worda w układzie karty GIOŚ |
| `components/habitat-form/habitat-form.css` | Cały wygląd karty |

## 3. Układ i nawigacja

Formularz odwzorowuje kartę docx jak najwierniej, żeby osoba wypełniająca nie miała przeskoku mentalnego.

- **Zakładki:**
  - Kolejność jak w karcie: Stanowisko, Stan ochrony, Oddziaływania, Zagrożenia, Inne informacje, Zdjęcia fitosocjologiczne.
  - Przełączanie jest swobodne: myszą, strzałkami albo Home/End.
  - Widok „Całość” pokazuje całą kartę naraz.
  - Pod formularzem są przyciski poprzedniej i następnej zakładki oraz „Zapisz kartę”.
- **Wygląd karty:** szare paski sekcji, pasek tytułowy „Karta obserwacji siedliska przyrodniczego na stanowisku” i etykiety pytań w lewej, szarej kolumnie, jak w docx.
- **Floating label:** poniżej szerokości 48rem kolumna etykiet zamienia się w etykiety pływające w polu. W grupach pól (np. „Powierzchnia, nachylenie, ekspozycja”) i w panelach pomiarów etykiety pływają zawsze.
- **Placeholder:**
  - W polu z pływającą etykietą placeholder istnieje w DOM tylko wtedy, gdy kursor jest w samym polu.
  - Pojawia się dopiero po animacji etykiety.
  - Fokus na przycisku „?” go nie wywołuje.
- **Jednostki:**
  - Jednostki (m n.p.m., m², °, %, cm) siedzą wewnątrz pola.
  - Czytnik ekranu dostaje jednostkę w etykiecie.
  - W polu z pływającą etykietą jednostka pokazuje się dopiero przy wpisywaniu albo po wypełnieniu.
- **Szerokość:**
  - Pełny wiersz zajmują współrzędne, długie pola tekstowe i listy.
  - Pola w panelu „Pomiary i progi” idą jedno pod drugim, na pełnej szerokości.
  - Pole w grupie z rozwiniętym „?” rozciąga się na cały wiersz, żeby wyjaśnienie było czytelne.
- **Daty:**
  - Wpisuje się je w formacie DD.MM.RRRR, a kropki wstawiają się same.
  - Obok jest przycisk kalendarza.
  - W danych zostaje ISO (RRRR-MM-DD).
  - Natywne pole daty odpada, bo pokazuje format z ustawień przeglądarki (np. 07/14/2025).
  - Nieistniejąca data (np. 31.02.2025) blokuje zapis.
- **Pola opisów:**
  - Startują wyżej: zwykle 6 linii, „Opis siedliska na stanowisku” 10, a komórki tabel 5.
  - Rosną razem z treścią, więc przykładowy tekst widać w całości.
- **Kolumna „Ocena wskaźnika”** ma 12rem, żeby mieściły się „Przyjmij X” i ostrzeżenie o odejściu od progów.
- **Telefon:** tabele zamieniają się w karty z etykietą przy każdej komórce.
  - Cele dotyku są większe: przyciski mają min. 2,5 rem, a „?” 1,75 rem.
  - Przyciski stopki zajmują całą szerokość.
  - Efekt hover działa tylko na urządzeniach z myszą, więc po dotknięciu nie zostaje „przyklejony”.
- **Tryb ciemny:**
  - Kolory są zmiennymi `--hf-*` na `.hf`. Ciemne wartości nadpisuje `@media (prefers-color-scheme: dark)`.
  - Nie używamy funkcji `light-dark()`. Minifikator CSS w buildzie Vite zamienia ją na protezę, która działa tylko wtedy, gdy `color-scheme` jest zadeklarowane w tym samym przetwarzanym CSS. Bez tego w wersji produkcyjnej znikały ramki i tła przycisków.
  - Przyciski mają własne tło i jaśniejszą ramkę. Pola wpisywania są ciemniejsze od tła.
  - Wybrana zakładka ma zielony pasek u góry.
  - Checkbox i natywne kontrolki dostają `color-scheme` oraz `accent-color`.
  - `.hf` ustawia własną czcionkę (system-ui), więc nie zależy od `index.html`.

## 4. Sekcje karty i pola

Każda sekcja odpowiada sekcji karty docx i używa jej etykiet.

| Sekcja | Co zawiera | Decyzje |
| --- | --- | --- |
| Stanowisko | Kod i nazwa siedliska (stałe), nazwa stanowiska, GUID, zbiorowiska, opis, powierzchnia płatu (ha), obszary chronione, współrzędne początku, środka i końca transektu, wymiary transektu, wysokość n.p.m., data, wykonawca | Wymiary mają domyślnie „200x10 m”. Wysokość jest tekstem, bo bywa zakresem („656–658”). Data spoza okresu od 1 lipca do 15 sierpnia daje ostrzeżenie, a nie błąd |
| Stan ochrony | Tabela z kolumnami: parametr, wskaźnik, wartość lub opis, ocena wskaźnika, ocena parametru. Pod nią perspektywy ochrony oraz ocena ogólna z uzasadnieniem | 11 wskaźników w kolejności karty. Wskaźniki kardynalne są pogrubione. Listy gatunków z pokryciem są widoczne od razu w kolumnie wartości. Pozostałe pomiary i progi są pod przyciskiem „Pomiary i progi” (albo „Progi oceny”) |
| Oddziaływania | Tabela z kolumnami: kod, nazwa, wpływ (−/0/+), intensywność (H/M/L), opis | Znany kod uzupełnia nazwę po wyjściu z pola. Lista podpowiada kody typowe dla 7120 |
| Zagrożenia | Tabela z kolumnami: kod, nazwa, opis | Ta sama lista kodów co przy oddziaływaniach |
| Inne informacje | Inne wartości przyrodnicze, działania ochronne, uwagi, dokumentacja fotograficzna | Szczegóły w punkcie 4.2 |
| Zdjęcia fitosocjologiczne | Położenie, wysokość, powierzchnia (m², domyślnie 25), nachylenie, ekspozycja, zwarcie i wysokość warstw A–D, jednostka fitosocjologiczna, skład gatunkowy wg warstw | Szczegóły w punkcie 4.1 |

### 4.1 Zdjęcia fitosocjologiczne

Liczba zdjęć nie jest sztywna.

- Nowa karta ma 3 zdjęcia (początek, środek i koniec transektu).
- Zdjęcia można dodawać („+ Dodaj zdjęcie fitosocjologiczne”) i usuwać. Numeracja rzymska się przelicza.
- Grupa „Zwarcie i wysokość warstw A, B, C, D” ma 8 pól ułożonych w 4 kolumny (na telefonie w 2):
  - w pierwszym wierszu zwarcie A–D (%),
  - w drugim wysokość A i B (m) oraz C i D (cm).
- Przy mniej niż 3 zdjęciach pojawia się ostrzeżenie. Przykłady z docx mają 0 zdjęć, bo karta ich nie ma.

### 4.2 Dokumentacja fotograficzna

To wgrywanie zdjęć, a nie pole tekstowe.

- **Dodawanie:** przycisk „Dodaj zdjęcia” (kilka plików naraz) albo przeciągnięcie plików na pole.
- **Podpisy:** każde zdjęcie ma miniaturę i podpis zaczynający się od „Fot. N.”. Po usunięciu zdjęcia numeracja w podpisach się przelicza. Podpis jest wymagany.
- **Pozycja bez pliku:** pozycja może mieć sam podpis, a plik da się dołączyć później.
- **Zapis:**
  - Zdjęcia są zmniejszane do 1600 px (JPEG).
  - Trafiają do JSON-a karty jako data URL, bo bez backendu nie ma innego miejsca.
  - To ok. 300 kB na zdjęcie.
  - Jeśli przeglądarka nie umie przeskalować pliku, zostaje oryginał.
- Pliki, które nie są obrazami, są pomijane z komunikatem.

## 5. Oceny

Formularz podpowiada ocenę z progów przewodnika, ale ostatnie słowo ma ekspert.

- **Skala:** FV (właściwy), U1 (niezadowalający), U2 (zły), XX (nieznany).
- **Wskaźniki:**
  - Parametr „Powierzchnia siedliska na stanowisku” ma jeden wskaźnik.
  - Pozostałe 10 należy do parametru „Struktura i funkcje”:
    - gatunki charakterystyczne,
    - gatunki dominujące,
    - pokrycie i struktura mchów,
    - obce gatunki inwazyjne,
    - gatunki ekspansywne,
    - krzewy i podrost drzew,
    - udział dobrze wykształconych płatów,
    - stopień uwodnienia,
    - pozyskanie torfu,
    - melioracje odwadniające.
- **Wskaźniki kardynalne:** gatunki charakterystyczne, mchy i gatunki ekspansywne.
- **Podpowiedź:**
  - Liczy się z pomiarów, np. pokryć gatunków, głębokości wody w 5 punktach albo stanu melioracji.
  - Gdy różni się od wybranej oceny, jest przycisk „Przyjmij X”.
  - Gdy się zgadza, pojawia się „✓ zgodnie z progami”.
  - Ocena odbiegająca od progów daje ostrzeżenie, żeby uzasadnić ją w opisie, ale jest dozwolona.
- **„Wstaw z pomiarów”** buduje tekst do kolumny „Wartość lub opis” z wpisanych pomiarów.
- **Agregacja struktury:**
  - U2 we wskaźniku kardynalnym daje U2.
  - XX we wskaźniku kardynalnym daje XX.
  - Wszystkie kardynalne FV i brak U2 w pozostałych daje FV.
  - W każdym innym przypadku wychodzi U1.
- **Ocena ogólna:** najgorsza z ocen powierzchni, struktury i perspektyw ochrony. XX liczy się tylko wtedy, gdy nie ma U1 ani U2. Formularz liczy ją sam, a użytkownik pisze uzasadnienie.
- **Ostrzeżenia merytoryczne:** na przykład pokrycie krzewów powyżej 50% sugeruje siedlisko 91D0.

## 6. Gatunki

Wybór gatunku to przeszukiwalny combobox z katalogu, z możliwością dodania pozycji spoza katalogu.

- **Katalog:**
  - Ok. 77 gatunków 7120 z nazwą naukową, polską i grupą (charakterystyczne naczyniowe, mchy, torfowce kępowe i dolinkowe, ekspansywne, drzewa i krzewy, inwazyjne, inne).
  - Na grupach opierają się podpowiedzi ocen.
- **Wyszukiwanie:**
  - Każde wpisane słowo musi być początkiem słowa w nazwie naukowej lub polskiej.
  - Wielkość liter i polskie znaki nie mają znaczenia, więc „sph fal” i „zurawina” działają.
  - Skrót „S.” rozumie jako Sphagnum.
- **Pozycja spoza katalogu:** opcja „Dodaj własny: …”. Taki gatunek jest zapisywany, ale nie liczy się w podpowiedziach ocen i ma oznaczenie „spoza katalogu”.
- **Obsługa:** pełna obsługa z klawiatury (strzałki, Enter, Escape). Enter w tym polu nigdy nie wysyła formularza.
- **Skład gatunkowy w zdjęciach fitosocjologicznych:**
  - Wiersz ma warstwę (A drzewa, B krzewy i podrost, C zielna i krzewinki, D mszysta), gatunek i ilościowość w skali Braun-Blanqueta (r, +, 1–5).
  - Warstwa podpowiada się z katalogu (np. torfowce do D, drzewa do B), ale można ją zmienić.
  - Ten sam gatunek może wystąpić w kilku warstwach.
- **Wskaźniki gatunkowe:**
  - Lista stoi w kolumnie „Wartość lub opis”.
  - Każdy wiersz to gatunek i pokrycie w % transektu.
  - Na dole jest wiersz dodawania: wybierałka gatunku, pole pokrycia i „+ Dodaj gatunek”.
  - Wybór gatunku przenosi kursor do pokrycia, Enter dodaje wiersz i wraca do wybierałki.
- **Pokrycie** przyjmuje „40”, „0,5”, „5%” i „<1”. Wartość „<1” liczy się jako 0,5 i tak też się wyświetla.

## 7. Wyjaśnienia pól

Każde pole ma przycisk „?”, który otwiera dymek nad formularzem z szerokim wyjaśnieniem: co wpisać i dlaczego. Dymek jest poza kolumną, więc jej szerokość go nie ściska. Zamyka go Escape, kliknięcie obok albo ✕.

- Wyjaśnienia mają dwie warstwy: instrukcję dla początkującego i uzasadnienie metodyczne (akapit „Dlaczego: …”) dla zaawansowanego, bez szukania w przewodniku.
- Wyjaśnienia mają też nagłówki wskaźników, kolumn tabeli, oddziaływań, skal B-B i warstw.
- Przełącznik „Rozwiń wszystkie wyjaśnienia (tryb dla początkujących)” pokazuje wszystkie wyjaśnienia naraz jako panele w treści. Pole z takim panelem zajmuje cały wiersz grupy.
- Test pilnuje, żeby każde pole metodyki miało wyjaśnienie dłuższe niż 60 znaków.

## 8. Walidacja, zapis, przykłady i anonimizacja

Błędy pokazują się dopiero wtedy, gdy mają sens, a zapis bez backendu oznacza pobranie pliku JSON.

- **Walidacja:**
  - Pola wymagane mają gwiazdkę, a komunikaty są po polsku.
  - Liczby przyjmują przecinek.
  - Nowo dodany wiersz listy nie świeci na czerwono, dopóki nie zostanie dotknięty albo nie będzie próby zapisu.
- **Zapis z błędami:**
  - Komunikat „Karta nie zapisana. Błędy w: …”.
  - Skok do pierwszej zakładki z błędem.
  - Znacznik „zawiera błędy” na zakładkach.
  - Pod tabelą stanu ochrony jest lista brakujących ocen.
- **Zapis poprawny:** podgląd i pobranie karty jako JSON, łącznie ze zdjęciami.
- **Przykłady:**
  - Przyciski „Wczytaj przykład: Reptowo 2” i „Wczytaj przykład: Reptowo IV” ładują dane z karty docx.
  - Obie karty dają ocenę ogólną U2.
  - W obu oceny ekspertów za powierzchnię odbiegają od progów (FV zamiast U1), a w Reptowie IV także za pozyskanie torfu.
- **Anonimizacja:**
  - Prawdziwe nazwisko obserwatora z docx nie występuje nigdzie w kodzie, przykładach ani testach.
  - W jego miejscu jest „Jan Kowalski”, a w podpisach zdjęć „(fot. J. Kowalski)”.
  - Test sprawdza to pozytywnie, bez wpisywania prawdziwego nazwiska.

## 9. Eksport do Worda

Przycisk „Pobierz kartę (.docx)” obok „Zapisz kartę” zapisuje kartę w układzie oryginalnej karty obserwacji GIOŚ.

- **Kiedy działa:** eksportuje to, co jest wpisane, także kartę niedokończoną. Walidacja nie blokuje eksportu.
- **Układ jak w oryginale:**
  - A4, marginesy 2,5 cm, Times New Roman 10 pt.
  - Szerokości kolumn przepisane z docx.
  - Kolory: pasek tytułowy A6A6A6, paski „Stanowisko” i „Stan ochrony” BFBFBF, pozostałe D9D9D9, kolumna etykiet F2F2F2.
  - Nad tabelą notka o wskaźnikach kardynalnych.
- **Sekcje:**
  - stanowisko,
  - stan ochrony (oceny parametrów i ogólna liczone jak w formularzu, wskaźniki kardynalne pogrubione),
  - oddziaływania,
  - zagrożenia,
  - inne informacje ze zdjęciami (szerokość ok. 11 cm, podpis pod zdjęciem),
  - zdjęcia fitosocjologiczne z tabelą składu gatunkowego posortowaną wg warstw. Tej sekcji nie ma w oryginalnej karcie, więc dochodzi na końcu.
- **Formatowanie:**
  - Nazwy łacińskie z katalogu idą kursywą.
  - Daty w formacie DD.MM.RRRR, liczby z przecinkiem i jednostką.
  - Puste pola dostają „–”.
- **Nazwa pliku:** `Karta_<kod>_<stanowisko>_<data>.docx`, np. `Karta_7120_Reptowo_2_14.07.2025.docx`.

## 10. Testy i otwarte kwestie

Jest 70 testów i wszystkie przechodzą. `tsc` i build są czyste, a wygląd sprawdzono w przeglądarce przy 1280 i 390 px.

- **Zakres testów:**
  - logika ocen,
  - metodyka 7120 (kolejność wskaźników, progi, przykłady, wyjaśnienia, anonimizacja, warstwy katalogu),
  - wyszukiwarka gatunków,
  - formularz (zakładki, kolumny tabeli, jednostki, klawiatura, zapis z błędami, przyjmowanie podpowiedzi, gatunki własne, kody oddziaływań, dodawanie i usuwanie zdjęć fitosocjologicznych, wyjaśnienia, placeholdery, wgrywanie zdjęć).
- **Otwarte kwestie:**
  - Nachodzenie placeholdera na etykietę (np. przy „Ekspozycji”) nie dało się odtworzyć w Chromium. Poprawka nie zależy od przeglądarki, ale trzeba ją potwierdzić w przeglądarce, w której wystąpił problem.
  - Przy wielu zdjęciach JSON karty robi się duży (30 zdjęć to ok. 9 MB). Trwałe przechowywanie wymaga backendu albo eksportu zdjęć osobno.
  - Lista kodów oddziaływań i katalog gatunków obejmują to, co najczęstsze dla 7120, a nie pełne słowniki.
