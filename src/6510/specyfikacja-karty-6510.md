# Karta 6510 – niżowe i górskie świeże łąki (Arrhenatherion elatioris), wariant RDOŚ Wrocław

## Źródła
- Przewodnik metodyczny GIOŚ (wskaźniki, progi FV/U1/U2).
- Wzór karty RDOŚ we Wrocławiu (xlsx, PZO): arkusze „część ogólna”, „zdjęcia fitosocjologiczne”, „ocena”,
  „oddziaływania_zagrożenia”, „działania”, ukryte „słowniki”.
- Przykłady: PLH020050_6510_02 i PLH020050_6510_06 (Dolina Dolnej Kwisy), wykonawca zanonimizowany do „Jan Kowalski”,
  podpisy zdjęć `kod_nr_Kowalski`.

## Wskaźniki
Powierzchnia, % powierzchni, gatunki charakterystyczne (kardynalny; Arrhenatheretum >4 FV, 3–4 U1;
Poa-Festuca ≥3 FV, 2 U1), dominanty, gatunki obce, ekspansywne (kardynalny), krzewy i podrost (<1 / 1–5 / >5%),
% dobrze zachowanych płatów, wojłok, struktura przestrzenna.

## Odstępstwa RDOŚ od karty GIOŚ (wspólne z 6410, moduł `src/rdos`)
- Kod stanowiska `PLx000000_6510_nazwa` (ostrzeżenie, nie błąd); kod obszaru ze słownika 94 obszarów.
- Współrzędne zdjęć w PL-1992.
- Zakładka „Ocena referencyjna”: ocena, wartość, termin osiągnięcia, powód nieosiągalności FV – dla każdego wskaźnika
  i perspektyw; ocena referencyjna struktury i ogólna liczona tak jak bieżąca.
- Zakładka „Działania ochronne”: tabela ze słownikami (rodzaj, typ, cel, charakter).
- Oddziaływania i zagrożenia według listy z 2011 r. (413 kodów), intensywność H/M/L eksportowana jako A/B/C.
- Eksport „Pobierz arkusz RDOŚ (.xlsx)”: układ wzoru, formuły (VLOOKUP nazw, kody pomocnicze) przeliczane przy otwarciu.

## Znane różnice podpowiedzi formularza i ocen eksperta
- 6510_02, gatunki charakterystyczne: podpowiedź U1, ekspert FV – w karcie zostaje ocena eksperta.
