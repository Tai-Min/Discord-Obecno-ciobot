module.exports = {
    aboutCommand: 'info',
    helpCommand: 'pomoc',
    assigmentCommand: 'specki',
    persenceCommand: 'obecnosc',

    aboutDescription: 'Zwraca informacje o tym bocie.',
    helpDescription: 'Wyświetla dostępne komendy dla tego bota.',
    assigmentDescription: 'Włącza bądź wyłącza możliwość przypisania specjalizacji.',
    persenceDescription: 'Generuje plik csv z listą studentów znajdujących się na kanale głosowym.',

    welcomeEmbedColor: '#9b59b6',
    welcomeEmbedTitle: "Witaj na serwerze %GUILD_NAME%, %NAME%!",
    welcomeEmbedDescription: `
Jestem automatem wspomagającym sprawdzanie obecności podczas zajęć prowadzonych na tym serwerze.

`,
    welcomeEmbedForPresenters: "JEŻELI JESTEŚ PROWADZĄCYM",
    welcomeEmbedDescriptionForPresenters: `
Wkrótce otrzymasz rangę prowadzącego umożliwiającą dołączanie do głosowych oraz tekstowych kanałów wykładowych.
Po otrzymaniu rangi wykładowcy, włączona zostanie komenda ">obecnosc", której użycie na kanale głosowym wygeneruje listę studentów znajdujących się na tym kanale.`,
    welcomeEmbedForStudents: "JEŻELI JESTEŚ STUDENTEM",
    welcomeEmbedDescriptionForStudents: `
Aby otrzymać rolę studenta oraz uzyskać dostęp do kanałów Twojej specjalizacji, przejdź na kanał "wybór-specjalizacji" i kliknij na reakcję odpowiadającą Twojej specjalizacji.
WAŻNE! Podczas ewentualnej kontroli frekwencji na wykładzie najpierw brany jest pod uwagę twój pseudonim a w przypadku jego braku - tag Discorda. Aby mieć pewność, że zostaniesz odpowiednio wpisany/a na listę obecności, zmień swój pseudonim klikając prawym przyciskiem myszy na swoje konto (na liście studentów, po prawej stronie) i wybierz opcję "Zmiana pseudonimu" i ustaw pseudonim na swoje imię i nazwisko.`,
    welcomeEmbedFinish: `
Z pozdrowieniami,
%BOT_NAME%`,
    welcomeImage: "",
    welcomeEmbedFooter: "https://github.com/Tai-Min/Discord-Obecnosciobot",
    welcomeEmbedFooterImage: "",

    aboutEmbedMsg: `
Bot stworzony w celu sprawdzania obecności na zajęciach online na drugim semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki Politechniki Gdańskiej.
https://github.com/Tai-Min/Discord-Obecnosciobot
--------------------
The MIT License
--------------------
Copyright (c) 2020 Mateusz Pająk
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`, 
    aboutEmbedFooter: "https://github.com/Tai-Min/Discord-Obecnosciobot",
    aboutEmbedFooterImage: "",

    helpEmbedColor: '#9b59b6',
    helpEmbedTitle: "Pomoc",
    helpEmbedDescription: "Poniżej znajdują się dostępne dla Ciebie komendy:",
    helpEmbedImage: "",
    helpEmbedFooter: "https://github.com/Tai-Min/Discord-Obecnosciobot",
    helpEmbedFooterImage: "",

    votingEmbedColor: '#9b59b6',
    votingEmbedTitle: 'Wybór specjalizacji',

    persenceFailedMsg: "Wymagana obecność na kanale głosowym.",
    persenceSuccessMsg: `Lista obecności w załączniku.
Ze względu na błędne kodowanie znaków przez Excela, zaleca się otworzyć listę obecności najpierw w notatniku i z notatnika przekleić do Excela.`,
    persenceCsvFirstRow: "lp,nazwa discorda,przypisana specjalizacja\n",
    persenceFilename: "obecnosc.csv"
}