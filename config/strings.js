module.exports = {
    // command names
    aboutCommand: 'info',
    helpCommand: 'pomoc',
    assigmentCommand: 'specki',
    persenceCommand: 'obecnosc',
    tableCommand: 'tabela',
    autoTableCommand: 'autotabela',

    // command descriptions for help command
    aboutDescription: 'Zwraca informacje o tym bocie.',
    helpDescription: 'Wyświetla dostępne komendy dla tego bota.',
    assigmentDescription: 'Włącza bądź wyłącza możliwość przypisania specjalizacji.',
    persenceDescription: 'Generuje plik csv z listą studentów znajdujących się na kanale głosowym.',
    tableDescription: `Generuje tabelę z danymi wyciągniętymi z Google Spreadsheets. 
Format:
>tabela <Identyfikator arkusza, tzn długi ciąg znaków z udostępnionego linku> <Zakres komórek>. 
Przykładowo:
>tabela 1VPo5JEN_iWghirM4BxpTOWmlgtWU6mZNSYaEyZiQg_I Arkusz1!A1:D5`,
    autoTableDescription: `Generuje samoaktualizującą się co 10 minut tabelę z danymi wyciągniętymi z Google Spreadsheets.
Format:
>autotabela <Identyfikator arkusza, tzn długi ciąg znaków z udostępnionego linku> <Zakres komórek> <Ilość wiadomości przeznaczonych na tabelę>
Przykładowo:
>autotabela 1VPo5JEN_iWghirM4BxpTOWmlgtWU6mZNSYaEyZiQg_I Arkusz1!A1:D5 3
Wywołanie tej funkcji bez argumentów aktualizuje istniejące tabele.`,

    // embed stuff
    embedImage: "",
    embedColor: '#9b59b6',
    embedFooter: "https://github.com/Tai-Min/Discord-Obecnosciobot",
    embedFooterImage: "",

    // welcome message strings
    welcomeImage: "",
    welcomeEmbedTitle: "Witaj na serwerze %GUILD_NAME%, %NAME%!",
    welcomeEmbedDescription: `
Jestem automatem wspomagającym sprawdzanie obecności podczas zajęć prowadzonych na tym serwerze.

`,
    welcomeEmbedForPresenters: "JEŻELI JESTEŚ PROWADZĄCYM",
    welcomeEmbedDescriptionForPresenters: `
Wkrótce otrzymasz rangę prowadzącego umożliwiającą dołączanie do głosowych oraz tekstowych kanałów wykładowych.
Po otrzymaniu rangi wykładowcy, otrzymasz możliwość użycia komendy ">obecnosc", która użyta podczas obecności na kanale głosowym wygeneruje listę studentów znajdujących się na tym samym kanale.`,
    welcomeEmbedForStudents: "JEŻELI JESTEŚ STUDENTEM",
    welcomeEmbedDescriptionForStudents: `
Aby otrzymać rolę studenta oraz uzyskać dostęp do kanałów specjalizacji, przejdź na kanał "wybór-specjalizacji" i kliknij na reakcję odpowiadającą Twojej specjalizacji.
WAŻNE! Podczas ewentualnej kontroli frekwencji na wykładzie najpierw brany jest pod uwagę twój pseudonim a w przypadku jego braku - tag Discorda. Aby mieć pewność, że zostaniesz odpowiednio wpisany/a na listę obecności, zmień swój pseudonim klikając prawym przyciskiem myszy na swoje konto (na liście studentów, po prawej stronie), wybierz opcję "Zmiana pseudonimu" i ustaw pseudonim na swoje imię i nazwisko.`,
    welcomeEmbedFinish: `
Z pozdrowieniami,
%BOT_NAME%`,

    // about command strings
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
    
    // help command strings
    helpEmbedTitle: "Pomoc",
    helpEmbedDescription: "Poniżej znajdują się dostępne dla Ciebie komendy:",
    
    // voting command strings
    votingEmbedTitle: 'Wybór specjalizacji',

    // persence command strings
    persenceFailedMsg: "Wymagana obecność na kanale głosowym.",
    persenceSuccessMsg: `Lista obecności w załączniku.
Ze względu na błędne kodowanie polskich znaków przez Excela, zaleca się otworzyć listę obecności najpierw w notatniku i z notatnika przekleić do Excela.`,
    persenceCsvFirstRow: "lp,nazwa discorda,przypisana specjalizacja\n",
    persenceFilename: "obecnosc.csv",
    persenceChecked: " sprawdził obecność na kanale ",

    // table command strings
    tableGetFail: "Nie udało się przetworzyć podanego arkusza.",
    tableNotEnoughArguments: "Za mało argumentów.",
    tableGenerated: " utworzył tabelę na kanale ",

    // autotable command strings
    autotableGetFail: "Nie udało się przetworzyć podanego arkusza.",
    autotableGenerated: " utworzył automatyczną tabelę na kanale ",
    autotableReserved: "zarezerwowane",
    autotableUpdated: "Zaktualizowano automatyczne tabele.",
    autotableMsgCountFail: "Liczba wiadomości powinna być większa od 0.",

    // shared command strings
    commandUsed: " wywołał komendę ",
    commandTriedToUse: " próbował wywołać komendę ",
    commandPermissionFail: " ale nie posiada wymaganych uprawnień.",
    commandArgsCountFail: " ale nie podał wymaganej liczby argumentów.",
    commandNotInVoiceChannel: " ale nie jest na kanale głosowym.",
    commandArgsFail: " ale podał błędne argumenty."
}
