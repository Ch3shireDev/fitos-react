# FITOS – karty obserwacji siedlisk przyrodniczych

**👉 Otwórz aplikację: [ch3shiredev.github.io/fitos-react](https://ch3shiredev.github.io/fitos-react/)**

FITOS to aplikacja do wypełniania kart obserwacji siedlisk Natura 2000 w terenie, według metodyki
Państwowego Monitoringu Środowiska (GIOŚ). Formularze mają układ i pola oficjalnych kart, a oceny FV / U1 / U2
są podpowiadane na podstawie progów z przewodników metodycznych. Ostateczna ocena zawsze należy do eksperta.

Działa w przeglądarce na komputerze, tablecie i telefonie. Nie trzeba zakładać konta ani się logować.

## 🔒 Twoje dane nie opuszczają Twojego urządzenia

Krótko: **FITOS nie ma serwera, na który mógłby cokolwiek wysłać.** Wszystko, co wpiszesz, i każde dodane zdjęcie
zostaje na Twoim telefonie lub komputerze.

Co to znaczy w praktyce:

- **Nic nie jest wysyłane przez internet.** Aplikacja nie ma bazy danych w chmurze, nie ma kont użytkowników,
  nie ma statystyk odwiedzin, liczników ani reklam. Nikt (także autor) nie widzi, jakie siedliska opisujesz,
  gdzie jesteś ani co wpisujesz.
- **Działa bez zasięgu.** Wystarczy raz otworzyć stronę z internetem (najlepiej od razu zainstalować, patrz niżej).
  Potem karty działają w lesie, na torfowisku i w trybie samolotowym.
- **Robocza wersja karty zapisuje się sama, ale tylko w pamięci przeglądarki na tym urządzeniu.** Jeśli zamkniesz
  kartę albo telefon się rozładuje, po ponownym otwarciu wpisy i zdjęcia będą na miejscu. Kasuje je dopiero
  przycisk „Wyczyść”.
- **Gotową kartę zapisujesz jako zwykły plik u siebie:** `.zip` (karta razem ze zdjęciami, można go potem wczytać
  z powrotem), `.docx` (Word) albo `.xlsx` (Excel). Plik trafia do folderu „Pobrane” na Twoim urządzeniu.
  Co dalej z nim zrobisz (mail, dysk, pendrive), to już Twoja decyzja.

Uczciwie o tym, czego to **nie** oznacza:

- **Kopia robocza nie jest kopią zapasową.** Siedzi tylko w tej jednej przeglądarce na tym jednym urządzeniu.
  Wyczyszczenie danych przeglądarki („Wyczyść historię / dane witryn”), odinstalowanie aplikacji, tryb prywatny
  (incognito) albo zgubiony telefon oznaczają utratę niezapisanej karty. Nie da się jej odzyskać „z serwera”,
  bo serwera nie ma. **Po skończonej obserwacji zapisz kartę do pliku `.zip`.**
- **Kart nie widać na innych urządzeniach.** Karta zaczęta na telefonie nie pojawi się sama na komputerze.
  Przenosisz ją plikiem `.zip`.
- **Samą aplikację pobierasz z GitHub Pages** (tam jest hostowana). Jak każda strona internetowa, serwer GitHuba
  widzi przy pobieraniu standardowe informacje techniczne (adres IP, typ przeglądarki). Dostaje wyłącznie prośbę
  „daj mi pliki aplikacji”, a nigdy treść Twoich kart.
- **Link „Buy me a coffee”** w stopce prowadzi do zewnętrznego serwisu, ale tylko jeśli go klikniesz.
  Sama aplikacja nic tam nie wysyła.

## 📱 Jak zainstalować na telefonie

FITOS to tzw. aplikacja webowa (PWA): instaluje się prosto ze strony, bez Sklepu Play i App Store.
Po instalacji ma własną ikonę na ekranie i działa bez internetu.

**Android (Chrome, Edge, Samsung Internet)**
1. Otwórz [ch3shiredev.github.io/fitos-react](https://ch3shiredev.github.io/fitos-react/).
2. Stuknij menu ⋮ w prawym górnym rogu.
3. Wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego” i potwierdź.

**Android (Firefox)**
1. Otwórz stronę, stuknij menu ⋮.
2. Wybierz „Dodaj do ekranu głównego” (albo „Zainstaluj”) i potwierdź „Dodaj”.

**iPhone i iPad**
1. Otwórz stronę **w Safari** (w innych przeglądarkach na iPhonie ta opcja bywa niedostępna).
2. Stuknij „Udostępnij” (kwadrat ze strzałką w górę).
3. Wybierz „Do ekranu początkowego” i stuknij „Dodaj”.

**Komputer (Chrome, Edge)**
- Kliknij ikonę instalacji na końcu paska adresu albo menu ⋮ → „Zapisz i udostępnij” → „Zainstaluj stronę jako aplikację”.

Przed wyjazdem w teren otwórz zainstalowaną aplikację raz przy włączonym internecie, żeby pobrała wszystkie karty.
Strona główna aplikacji też pokazuje tę instrukcję, dopasowaną do Twojego telefonu.

## Obsługiwane siedliska

44 karty. Gwiazdka (\*) oznacza siedlisko priorytetowe.

**Siedliska nadmorskie i słonolubne**

| Kod | Siedlisko |
|-----|-----------|
| 1150\* | Zalewy i jeziora przymorskie (laguny) |
| 1210 | Kidzina na brzegu morskim |
| 1230 | Klify na wybrzeżu Bałtyku |
| 1310 | Śródlądowe błotniste solniska z solirodkiem |
| 1330 | Solniska nadmorskie |
| 1340\* | Śródlądowe słone łąki, pastwiska i szuwary |

**Wydmy nadmorskie i śródlądowe**

| Kod | Siedlisko |
|-----|-----------|
| 2110 | Inicjalne stadia nadmorskich wydm białych |
| 2120 | Nadmorskie wydmy białe |
| 2130\* | Nadmorskie wydmy szare |
| 2140\* | Nadmorskie wrzosowiska bażynowe |
| 2160 | Nadmorskie wydmy z zaroślami rokitnika |
| 2170 | Nadmorskie wydmy z zaroślami wierzby piaskowej |
| 2180 | Lasy mieszane i bory na wydmach nadmorskich |
| 2190 | Wilgotne zagłębienia międzywydmowe |
| 2330 | Wydmy śródlądowe z murawami napiaskowymi |

**Wody stojące i płynące**

| Kod | Siedlisko |
|-----|-----------|
| 3110 | Jeziora lobeliowe |
| 3130 | Brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z *Littorelletea*, *Isoëto-Nanojuncetea* |
| 3140 | Twardowodne jeziora z podwodnymi łąkami ramienic |
| 3150 | Starorzecza i naturalne eutroficzne zbiorniki wodne |
| 3160 | Naturalne, dystroficzne zbiorniki wodne |
| 3220 | Pionierska roślinność na kamieńcach górskich potoków |
| 3230 | Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków |
| 3240 | Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków |
| 3260 | Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników |
| 3270 | Zalewane muliste brzegi rzek |

**Wrzosowiska i zarośla**

| Kod | Siedlisko |
|-----|-----------|
| 4010 | Wilgotne wrzosowiska z wrzoścem bagiennym |
| 4030 | Suche wrzosowiska |
| 4060 | Wysokogórskie borówczyska bażynowe |
| 4070\* | Zarośla kosodrzewiny |
| 4080 | Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej |
| 40A0\* | Subkontynentalne zarośla okołopannońskie |
| 5130 | Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach |

**Łąki**

| Kod | Siedlisko |
|-----|-----------|
| 6410 | Zmiennowilgotne łąki trzęślicowe (*Molinion*) – wariant RDOŚ |
| 6510 | Ekstensywnie użytkowane niżowe łąki świeże (*Arrhenatherion*) – wariant RDOŚ |
| 65XX | Eutroficzne łąki wilgotne (*Calthion*) |

**Torfowiska**

| Kod | Siedlisko |
|-----|-----------|
| 7120 | Torfowiska wysokie zdegradowane, zdolne do naturalnej i stymulowanej regeneracji |

**Lasy**

| Kod | Siedlisko |
|-----|-----------|
| 91D0\* | Bory i lasy bagienne |
| 91E0\* | Łęgi wierzbowe, topolowe, olszowe i jesionowe |
| 91F0 | Łęgowe lasy dębowo-wiązowo-jesionowe |
| 91I0\* | Ciepłolubne dąbrowy |
| 91P0 | Jodłowy bór świętokrzyski |
| 91Q0 | Górskie reliktowe laski sosnowe |
| 91T0 | Śródlądowy bór chrobotkowy |
| 91XX | Olsy (kod roboczy GIOŚ, nie jest siedliskiem z zał. I dyrektywy) |

## Co potrafi

- zdjęcia fitosocjologiczne, wskaźniki stanu ochrony, oddziaływania i zagrożenia, perspektywy ochrony;
- automatyczne podpowiedzi ocen i ocena ogólna liczona według wskaźników kardynalnych;
- fotografie dołączane do karty prosto z aparatu telefonu;
- automatyczna kopia robocza na urządzeniu (patrz wyżej);
- zapis karty do `.zip` (razem z fotografiami), ponowne wczytanie i eksport do Worda (`.docx`);
- karty 6410 i 6510 w wariancie RDOŚ we Wrocławiu: ocena referencyjna, działania ochronne
  i eksport do Excela (`.xlsx`) w układzie arkusza RDOŚ;
- działa offline po zainstalowaniu.

---

## Dla deweloperów

```
npm install
npm run dev      # serwer deweloperski
npm test         # testy (vitest)
npm run build    # kompilacja i build produkcyjny
```

Stos: React 19, TypeScript, Vite (+ vite-plugin-pwa), react-hook-form + zod, vitest + Testing Library.
Eksport `.docx` biblioteką `docx`, wszystko generowane w przeglądarce.

- **Nowa karta** to folder `src/<KOD>/` z `Card<KOD>.tsx` i `meta.ts`. Rejestr (`src/cards.ts`) zbiera je przez
  `import.meta.glob`, więc trasa, kafelek na stronie głównej i strona SEO pojawiają się same.
- **Specyfikacje kart** (źródła, progi, odstępstwa od metodyki) leżą w ich katalogach jako
  `src/<kod>/specyfikacja-karty-<kod>.md`.
- **Kopia robocza** trzymana jest w IndexedDB (baza `fitos`, klucz `karta-<kod>`), bo zdjęcia jako data URL
  nie mieszczą się w limicie localStorage.
- **Prywatność to wymaganie, nie dodatek.** Aplikacja nie wykonuje żadnych żądań sieciowych z danymi
  użytkownika: brak `fetch` do zewnętrznych API, brak analityki, brak zewnętrznych fontów i skryptów z CDN.
  Nie dodawaj ich bez zmiany sekcji „Twoje dane” w tym pliku, bo użytkownicy na niej polegają.
