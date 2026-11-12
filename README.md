# FITOS – karty obserwacji siedlisk przyrodniczych

Aplikacja webowa (PWA) do wypełniania kart obserwacji siedlisk Natura 2000 w terenie, według metodyki
Państwowego Monitoringu Środowiska (GIOŚ). Formularze mają układ i pola oficjalnych kart, a oceny FV / U1 / U2
są podpowiadane na podstawie progów z przewodników metodycznych. Ostateczna ocena zawsze należy do eksperta.

## Obsługiwane siedliska

| Kod | Siedlisko |
|-----|-----------|
| 40A0 | Subkontynentalne zarośla okołopannońskie |
| 6410 | Zmiennowilgotne łąki trzęślicowe (Molinion) |
| 6510 | Ekstensywnie użytkowane niżowe i górskie łąki świeże (Arrhenatherion) |
| 65XX | Eutroficzne łąki wilgotne |
| 7120 | Torfowiska wysokie zdegradowane |
| 91D0 | Bory i lasy bagienne |
| 91E0 | Łęgi wierzbowe, topolowe, olszowe i jesionowe |
| 91F0 | Łęgowe lasy dębowo-wiązowo-jesionowe |
| 91I0 | Ciepłolubne dąbrowy |
| 91P0 | Jodłowy bór świętokrzyski |

## Możliwości

- zdjęcia fitosocjologiczne, wskaźniki stanu ochrony, oddziaływania i zagrożenia, perspektywy ochrony;
- automatyczne podpowiedzi ocen i ocena ogólna liczona wg wskaźników kardynalnych;
- zapis karty do `.zip` (razem z fotografiami) i eksport do Worda (`.docx`);
- karty 6410 i 6510 w wariancie RDOŚ we Wrocławiu: ocena referencyjna, działania ochronne
  i eksport do Excela (`.xlsx`) w układzie arkusza RDOŚ;
- działa offline, a dane zostają wyłącznie na urządzeniu użytkownika.

## Uruchomienie

```
npm install
npm run dev      # serwer deweloperski
npm test         # testy (vitest)
npm run build    # kompilacja i build produkcyjny
```

Stos: React 19, TypeScript, Vite, react-hook-form + zod, vitest + Testing Library.

Specyfikacje kart (źródła, progi, odstępstwa) leżą w ich katalogach jako `src/<kod>/specyfikacja-karty-<kod>.md`.
