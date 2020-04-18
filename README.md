# Discord-Obecnościobot
Bot stworzony w celu sprawdzania obecności na wykładach prowadzonych na platformie Discord.

## Instalacja narzędzi
W celu uruchomienia bota wymagane jest nodejs (https://nodejs.org/en/) oraz Yarn (https://classic.yarnpkg.com/en/).

Po zainstalowaniu wymaganych narzędzi należy zmienić nazwę pliku example_config.json na config.json. W pliku, w polu token należy dodać unikalny token bota (https://discordapp.com/developers zakładka bot -> "Click to Reveal Token") oraz zmienić ustawienia wedle uznania.

#### Opis ustawień pliku config.json:


## Uruchomienie bota
W folderze projektu, w oknie poleceń należy wywołać:
```
yarn install
yarn start
```

## Zaproszenie na serwer

Bota można zaprosić na serwer używając linku: <br/>
https://<span></span>discordapp.<span></span>com/oauth2/authorize?client_id=<CLIENT_ID>scope=bot&permissions=59392 <br/><br/>

Gdzie CLIENT_ID to umieszczone jest na https://discordapp.com/developers w zakładce General Information.

Żeby bot poprawnie działał, w pożądanych kanałach tekstowych musi mieć ustawione uprawnie czytania/wysyłania/usuwania wiadomości oraz załączanie plików i linków.

## Docker
```
docker pull node
```
W katalogu projektu:
```
docker-compose build
docker-compose up -d
```
