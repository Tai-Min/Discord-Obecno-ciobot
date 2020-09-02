# Discord-Obecnościobot
Bot stworzony w celu uproszczenia procesu prowadzenia zajęć na platformie Discord. 

## Możliwości
#### Dla prowadzących:
* Generowanie listy obecności osób z rolą studenta przebywających na kanale głosowym - plik csv o strukturze:<br/> lp,imie nazwisko,tag discorda
* Sprawdzanie frekwencji podczas zajęć x osób dostępnych na n możliwych,

### Dla administratorów:
* Dwa tryby zarządzania serwerem:
  * Swobodny - Obecność, frekwencja sprawdzane są na podstawie pseudonimów i nazw użytkowników przebywających na serwerze, brak kontroli kanałów głosowych,
  * Restrykcyjny - Obecność oraz frekwencja sprawdzone są na podstawie użytkowników dodanych do serwerowej listy studentów, nieobecność na tej liście wyrzuca studenta z kanału głosowego i odbiera wszystkie role.
* Dodawanie i usuwanie osób z serwerowej listy studentów pojedynczo i masowo, za pomocą pliku json,
* Sprawdzanie, czy osoba dana po imieniu i nazwisku, bądź po tagu, znajduje się na serwerowej liście studentów,
* Możliwość dodania wszystkich osób z rolą studenta do serwerowej listy studentów,
* Usuwanie z listy studentów osób - duplikatów (imie nazwisko lub tag).

Komendy sprawdzania studentów jak i usuwanie duplikatów ignorują wielkość liter oraz polskie znaki, czyli osoba Michał ąę zostanie uznana za duplikat osoby michal ae.


## Instalacja
Po rozpakowaniu repozytorium, do głównego folderu należy dodać jakikolwiek obrazek nazwany user_kicked.png (obrazek wyświetli się w wiadomości prywatnej usuniętej osoby) oraz zmienić nazwę pliku config/example_config.json na /config.json.<br/>
W pliku config.json, w polu token należy dodać unikalny token bota (https://discordapp.com/developers zakładka bot -> "Click to Reveal Token").

### config.json
Plik umożliwiający przypisywanie serwerowych ról do prowadzących, studentów i adminów oraz zmiana nazw poszczególnych komend.
* adminRoles - Tablica identyfikatorów ról przypisanych do administratorów,
* presenterRoles - Tablica identyfikatorów ról przypisanych do prowadzących,
* studentRoles - Tablica identyfikatorów ról przypisanych do studentów,
* botLogTextChannel - Identyfikator kanału tekstowego, na którym bot wypisuje logi,
* botMentionChannel - Identyfikator kanału tekstowego, na którym bot dokonuje ogłoszeń, np. pojawieniu się wykładowcy na kanale głosowym,
* rolesToMention - Tablica identyfikatorów ról, które powinny zostać oznaczone w ogłoszeniach bota,
* commandPrefix - Znak stawiany przed komendą,
* helpCommand - Wyświetla komendy dostępne dla danej roli wraz z ich opisem,
* statusCommand - Frekwencja na zajęciac,
* infoCommand - Wyświetla informacje o bocie,
* raportCommand - Generuje plik csv z obecnością,
* addStudentCommand - Dodanie pojedynczego studenta do serwerowej listy studentów,
* removeStudentCommand - Usunięcie studenta z serwerowej listy studentów,
* checkStudentCommand - Sprawdzenie, czy student znajduje się na serwerowej liście studentów,
* strictModeCommand - Włącza lub wyłącza tryb restrykcyjny,
* dumpCommand - Zwraca serwerową listę studentów jako plik json,
* insertAllCommand - Dodaje do serwera wszystkie osoby z przypisaną rolą studenta,
* cleanUpListCommand - Czyści serwerową listę studentów z duplikatów i osób nie znajdujących się na serwerze,
* insertListCommand - Podmienienie serwerowej listy studentów na załączony plik json.

### Instalacja bezpośrednia
#### Instalacja narzędzi
W celu uruchomienia bota wymagane jest nodejs (https://nodejs.org/en/) oraz Yarn (https://classic.yarnpkg.com/en/).

Po zainstalowaniu wymaganych narzędzi należy zmienić nazwę pliku example_config.json na config.json. 

#### Uruchomienie bota
W folderze projektu, w oknie poleceń należy wywołać:
```
yarn install
tsc
yarn start
```

### Instalacja w kontenerze (Docker)

```
docker-compose up -d
```

## Zaproszenie na serwer

Bota można zaprosić na serwer używając linku: <br/>
https://<span></span>discordapp.<span></span>com/oauth2/authorize?client_id=<CLIENT_ID>scope=bot&permissions=268494864<br/>

Gdzie CLIENT_ID to umieszczone jest na https://discordapp.com/developers w zakładce General Information.

Żeby bot poprawnie działał, w pożądanych kanałach tekstowych musi mieć ustawione uprawnie czytania/wysyłania/usuwania wiadomości oraz załączanie plików i linków.





