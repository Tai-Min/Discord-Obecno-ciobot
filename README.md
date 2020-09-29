# Discord-Obecnościobot
Bot stworzony w celu uproszczenia procesu prowadzenia zajęć na platformie Discord. 

## Możliwości
#### Dla prowadzących:
* Generowanie listy obecności osób z rolą studenta przebywających na kanale głosowym - plik csv o strukturze:<br/> lp,imie nazwisko,przydzielona specjalizacja.

### Dla administratorów:
* Komenda pozwalająca na automatyczne przydzielanie specjalizacji studentom przy użyciu reakcji.

## Instalacja
Po rozpakowaniu repozytorium należy zmienić nazwę pliku example_config.json na config.json i uzupełnić wymagane dane, w tym token, identyfikatory serwera oraz ról.<br/>
W polu token należy dodać unikalny token bota (https://discordapp.com/developers zakładka bot -> "Click to Reveal Token").<br/>
W polach identyfikatorów należy podać identyfikatory gildii oraz ról dostępne po kliknięciu prawym przyciskiem myszy na server / rolę przy włączonym trybie dewelopera (Ustawienia->Wygląd->Tryb dewelopera) i użycie opcji "Kopiuj ID".

### config.json

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





