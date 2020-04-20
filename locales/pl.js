module.exports = locale = {
    "errorMsg": "Coś poszło nie tak...",

    "adminHelp": `
---------------------
Komendy prowadzącego:
---------------------
%COMMAND_PREFIX%%HELP_COMMAND% - Wyświetla tą wiadomość.
%COMMAND_PREFIX%%STATUS_COMMAND% - Wyświetla aktualną frekwencję na wykładzie, wymaga obecności na kanale głosowym.
%COMMAND_PREFIX%%RAPORT_COMMAND% - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym.
    * W trybie restrykcyjnym lista generowana jest na podstawie listy studentów.
    * W trybie swobodnym lista generowana jest najpierw na podstawie pseudonimu a w przypadku jego braku, na podstawie nazwy użytkownika.
%COMMAND_PREFIX%%INFO_COMMAND% - Wyświetla informacje o tym bocie.

------------------------
Komendy administracyjne:
------------------------
%COMMAND_PREFIX%%ADD_STUDENT_COMMAND% "<IMIE NAZWISKO>" "<TAG DISCORDA>" - Dodaje studenta do listy studentów.
%COMMAND_PREFIX%%REMOVE_STUDENT_COMMAND% <TAG DISCORDA> - Usuwa studenta z listy studentów.
%COMMAND_PREFIX%%CHECK_STUDENT_COMMAND% %NAME_PARAM% "<IMIE NAZWISKO>" | tag "<TAG DISCORDA>" - Sprawdza, czy student znajduje się na liście studentów.
%COMMAND_PREFIX%%DUMP_COMMAND% - Wypisuje wszystkie osoby na liście studentów do pliku json.
%COMMAND_PREFIX%%INSERT_ALL_COMMAND% - Dodaje do listy studentów wszystkie osoby posiadające przynajmniej jedną z roli studenta, zwraca logi operacji załączone w pliku txt.
%COMMAND_PREFIX%%CLEANUP_COMMAND% - Czyści listę studentów z nieaktualnych tagów, powtórek tagów oraz powtórek imion i nazwisk (w tym podobnych imion i nazwisk). W przypadku napotkania powtórki usuwane są wszystkie powrórki.
%COMMAND_PREFIX%%INSERT_LIST_COMMAND% - Aktualizuje listę studentów na podstawie załączonego pliku json (format taki sam jak uzyskany przy pomocy komendy %COMMAND_PREFIX%%DUMP_COMMAND%).
%COMMAND_PREFIX%%STRICT_MODE_COMMAND% on|off - Włącza lub wyłącza tryb restrykcyjny (wstęp do kanałów głosowych tylko na podstawie listy studentów).
    
Ta wiadomość zniknie za 60 sekund...`,

    "presenterHelp": `
%COMMAND_PREFIX%%HELP_COMMAND% - Wyświetla tą wiadomość.
%COMMAND_PREFIX%%STATUS_COMMAND% - Wyświetla aktualną frekwencję na wykładzie, wymaga obecności na kanale głosowym.
%COMMAND_PREFIX%%RAPORT_COMMAND% - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym. 
    * W trybie restrykcyjnym lista generowana jest na podstawie listy studentów.
    * W trybie swobodnym lista generowana jest najpierw na podstawie pseudonimu a w przypadku jego braku, na podstawie nicku.
%COMMAND_PREFIX%%INFO_COMMAND% - Wyświetla informacje o tym bocie.
    
Ta wiadomość zniknie za 60 sekund...`,

    "statusMsgStrict": `Obecność: %PRESENT_STUDENTS%/%TOTAL_STUDENTS% studentów na serwerowej liście studentów.`,
    "statusMsg": `Obecność: %PRESENT_STUDENTS%/%TOTAL_STUDENTS% całkowitej ilości studentów na serwerze.`,

    "raportErrorLog": `
UWAGA: Użytkownik %NICKNAME%, %USERNAME%, %TAG% nie znajduje się na liście studentów i pomimo załączonego trybu restrykcyjnego znajduje się na kanale głosowym. 
To nie powinno się zdarzyć.
Użytkownik dodany do listy obecnosci na podstawie pseudonimu lub nazwy użytkownika.`,

    "raportErrorLogShort":
`UWAGA: Niektórzy użytkownicy nie znajdują się na liście studentów i pomimo załączonego trybu restrykcyjnego znajdują się na kanale głosowym
To nie powinno się zdarzyć.
Użytkownicy dodani do listy obecnosci na podstawie pseudonimu lub nazwy użytkownika.`,

    "raportFilePrefix": "Zajecia",
    "raportMsg": 
`W załączniku znajduje się lista obecności, plik ma formę:
Liczba porządkowa, imię i nazwisko, tag Discord

UWAGA PLIK NALEŻY OTWORZYĆ W NOTATNIKU ZE WZGLĘDU NA TO, ŻE EXCEL NIE KODUJE DOBRZE POLSKICH ZNAKÓW.`,

//please keep the link and license
    "infoMsg": `
Bot stworzony w celu sprawdzania obecności na zajęciach online na pierwszym semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki Politechniki Gdańskiej.
https://github.com/Tai-Min/Discord-Obecnosciobot

--------------------
The MIT License
--------------------

Copyright (c) 2020 Mateusz Pająk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,

    "addAddedMsg": "Dodano %NAME% do listy studentów.",
    "addExistsMsg": "%TAG% znajduje się już na liście studentów jako %NAME%.",

    "removeNotExistsMsg": "%TAG% nie znajduje się na liście studentów.",
    "removeRemovedMsg": "Osoba %TAG% została usunięta z listy studentów.",

    "checkName": "imie",
    "checkExistTagMsg": "%TAG% znajduje się na liście studentów jako %NAME%.",
    "checkNotExistsTagMsg": "%TAG% nie znajduje się na liście studentów.",
    "checkExistsNameMsg": "%NAME% znajduje się na liście studentów jako %TAG%",
    "checkNotExistsNameMsg": "%NAME% nie znajduje się na liście studentów.",
    "checkExistsMultipleNameMsg": "%NAME% znajduje się na liście studentów jako",
    "checkExistsMultipleNameShortMsg": "Zbyt dużo osób z tym imieniem na liście, nie mogę wyświetlić.",

    "dumpMsg": "Lista studentów w załączniku:",
    "dumpFilename": "lista",

    "insertAllMsg":
`Uzupełniam listę studentów...
Logi znajdują się w załączniku:`,

    "insertAllAddingMsg": "Dodaję %NAME% : %TAG% do listy studentów...",
    "insertAllExistsMsg": "Użytkownik %NAME% : %TAG% istnieje już na liście.",
    "insertAllExistsTagMsg": "%TAG% istnieje w bazie jako %NAME%!",

    "cleanupMsg": "Lista wyczyszczona z powtórek i nieznalezionych tagów.",

    "insertMsg": "Lista studentów została zmieniona.",

    "strictStateOnMsg": "Restrykcje są nałożone.",
    "strictStateOffMsg": "Restrykcje nie są nałożone.",
    "strictEnabledMsg": "Restrykcje zostały nałożone.",
    "strictDisabledMsg": "Restrykcje zostały zdjęte.",

    "warnVoice": "Użycie tej komendy wymaga obecności na kanale głosowym.",
    "warnParam": 
`Nieprawidłowa ilość argumentów lub zły typ argumentu.
Użyj %COMMAND_PREFIX%%HELP_COMMAND% po więcej informacji.`,
    "warnAttach": 
`Nieprawidłowa ilość załączników lub zły typ załącznika.
Użyj %COMMAND_PREFIX%%HELP_COMMAND% po więcej informacji.`,

    "presenterFirstMsgLog":
`Prowadzący %NAME% pierwszy raz pojawił się na kanale głosowym, wysyłano wiadomość powitalną o treści:`,

    "studentKickMsgLog":
`Użytkownik %NAME% : %TAG% próbował wejść na kanał pomimo nieobecności na liście studentów wobec czego został wyrzucony i zdegradowany.
Użytkownik otrzymał stosowną wiadomość:`,

    "adminWarnMsgLog":
`Administrator bądź prowadzący %NAME% z rangą studenta wszedł na kanał głosowy pomimo nieobecności na liście studentów i załączonego trybu restrykcyjnego.
Użytkownikowi została wysłana następująca wiadomość prywatna:`,

    "presenterFirstMsg":
        `Szanowny Panie.

Miło mi powitać Pana na serwerze %GUILD_NAME%.
Jestem automatem umożliwiającym kontrolę uczestnictwa na zajęciach prowadzonych na platformie Discord.
Aby dokonać sprawdzenia uczestnictwa należy na dostępnym kanale tekstowym (np. #wykład) wpisać komendę "%COMMAND_PREFIX%%RAPORT_COMMAND%".
Dodatkowo, serwer umożliwia sprawdzenie aktualnej frekwencji przy pomocy komendy "%COMMAND_PREFIX%%STATUS_COMMAND%".
W celu uzyskania pomocy dostępna jest komenda "%COMMAND_PREFIX%%HELP_COMMAND%".
Informacje o automacie dostępne są pod komendą "%COMMAND_PREFIX%%INFO_COMMAND%".
W przypadku pytań proszę kierować się do administratorów serwera.

Z wyrazami szacunku,
%BOT_NAME%`,

    "studentKickMsg":
        `Ups...

Serwer jest obecnie w trybie restrykcyjnym i wygląda na to, że nie jesteś wpisany na listę studentów.
Ze względu na to, twoja ranga studenta została zdjęta.

Powód:
Prawdopodobnie nie podałeś swojego nazwiska, przez co nie ma możliwości wpisania Ciebie na listę obecności, bądź istnieje więcej niż jedna osoba o takich samych danych.

W celu rozwiązania sprawy skontaktuj się z administracją serwera.`,

    "adminWarnMsg":
        `Ups...

Serwer jest obecnie w trybie restrykcyjnym i wygląda na to, że nie jesteś wpisany na listę studentów. Twoja obecność nie zostanie uwzględniona w pliku obecności.
Ze względu na posiadaną przez Ciebie rangę, nie mam możliwości zdjęcia ci rangi studenta, jednak zalecam dodać siebie do listy studentów za pomocą komendy %COMMAND_PREFIX%%ADD_STUDENT_COMMAND% "<IMIE NAZWISKO>" "<TAG DISCORDA>".`,

    "studentKickReasonMsg": "Nie na liście studentów."
}