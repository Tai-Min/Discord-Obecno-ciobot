# Discord-Obecnościobot
Bot stworzony w celu uproszczenia procesu prowadzenia zajęć na platformie Discord. 

## Możliwości
#### Dla prowadzących:
* Generowanie listy obecności osób z rolą studenta przebywających na kanale głosowym - plik csv o strukturze:<br/> lp,imie nazwisko,przydzielona specjalizacja.
* Generowanie tabel na podstawie dokumentów Google Spreadsheets.
* Generowanie dynamicznych tabel, aktualizowanych co 10 minut na podstawie dokumentów Google Spreadsheets.

#### Dla administratorów:
* Komenda pozwalająca na automatyczne przydzielanie specjalizacji studentom przy użyciu reakcji.

## Instalacja
Po rozpakowaniu repozytorium należy zmienić nazwę pliku example_config.json na config.json i uzupełnić wymagane dane według następnego podpunktu.<br/>

### config.json
* botToken - Token bota z https://discordapp.com/developers -> Bot -> Click to Reveal Token.
* guildId - Identyfikator gildii otrzymywany poprzez opcję Kopiuj ID po naciśnięciu prawym przyciskiem myszy na nazwę serwera (w trybie dewelopera).
* logChannelId - Identyfikator kanału logów bota otrzymywany poprzez opcję Kopiuj ID po naciśnięciu prawym przyciskiem myszy na dany kanał tekstowy (w trybie dewelopera).
* voteChannelId - Identyfikator kanału, na którym pojawiać się będzie opcja przypisania do danej specjalizacji, otrzymywany tak jak logChannelId.
* adminRoles - Zbiór identyfikatorów ról administratorów serwera. Identyfikatory otrzymywane są przez opcję Kopiuj ID dostępną w ustawieniach serwera -> Role -> prawy przycisk myszy na daną rolę.
* presenterRoles - Zbiór identyfikatorów ról przyznawanych wykładowcom. Otrzymywane tak, jak adminRoles.
* studentRoles - Zbiór identyfikatorów ról przyznawanych studentom. Otrzymywane tak, jak adminRoles.
* specs - Zbiór obiektów specjalizacji. Każdy obiekt powinen posiadać następujące pola:
  * name - Nazwa specjalizacji.
  * reaction - Emoji reakcji, na którą trzeba zagłosować, aby wybrać specjalizację.
  * rolesToAssign - Zbiór identyfikatorów ról przyznawanych danej specjalizacji. Otrzymywane tak, jak adminRoles.
  * rolesToRemove - Zbiór identyfikatorów ról, których dana specjalizacja mieć nie powinna. Przykładowo mogą to być identyfikatory ról innych specjalizacji. Otrzymywane tak, jak adminRoles.
* statusMsg - Wiadomość wyświetlana pod nickiem bota.
* commandPrefix - Ciąg znaków, które powinny pojawić się na początku wiadomości, aby bot zareagował na komendę.
* spreadsheetsApiKey - Klucz api z https://console.developers.google.com/?hl=PL z włączonym api do Google Spreadsheets. Opcjonalne, używane w przypadku wykreślania tabel za pomocą komendy tableCommand lub autoTableCommand.

### strings.js
* aboutCommand - Komenda wyświetlająca informacje o bocie.
* helpCommand - Komenda wyświetlająca dostępne dla danej roli komendy.
* assigmentCommand - Komenda włączająca bądź wyłączająca możliwość wyboru specjalizacji.
* persenceCommand - Komenda generująca plik csv z frekwencją na kanale głosowym, na którym znajduje się osoba wywołująca komendę.
* tableCommand - Komenda wykreślająca tabelę z danego zakresu komórek z Google Spreadsheets.
* autoTableCommand - Komenda wykreślająca dynamiczną tabelę z danego zakresu komórek z Google Spreadsheets
* welcomeEmbedDescriptionForPresenters - Wiadomość powitalna dla wykładowców.
* welcomeEmbedDescriptionForStudents - Wiadomość powitalna dla studentów.
<br/>
Reszta opcji to komunikaty wyświetlane przez bota.

### Instalacja bezpośrednia
#### Instalacja narzędzi
W celu uruchomienia bota wymagane jest [NodeJS](https://nodejs.org/en/).

#### Uruchomienie bota
W folderze projektu, w oknie poleceń / terminalu należy wywołać:<br\>
```
npm start
```

### Instalacja w kontenerze (Docker)
W folderze projektu, w oknie poleceń / terminalu należy wpisać:<br/>
```
docker-compose up -d
```
Komenda ta zbuduje i uruchomi w tle kontener dockera z botem. W celu wyłączenia kontenera należy wpisać w tym samym folderze:<br/>
```
docker-compose down
```

## Zaproszenie na serwer

Bota można zaprosić na serwer używając linku: <br/>
https://<span></span>discordapp.<span></span>com/oauth2/authorize?client_id=<CLIENT_ID>scope=bot&permissions=8<br/>

Gdzie CLIENT_ID to umieszczone jest na https://discordapp.com/developers w zakładce General Information.





