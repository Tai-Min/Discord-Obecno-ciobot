const Discord = require('discord.js');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const config = require('./config/config.json');
import { helpers } from './helpers';
import { commands } from './commands';
import { db } from './db';
import { roles } from './roles';

moment.locale('pl');

const client = new Discord.Client();

const replyHelp = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    let msgStr = "<<Coś poszło nie tak (replyHelp)>>";
    if (roles.isAdmin(msg.member)) {
        msgStr =
            `
Komendy prowadzącego:
${commands.commandPrefix}${commands.helpCommand} - Wyświetla tą wiadomość.
${commands.commandPrefix}${commands.statusCommand} - Wyświetla aktualną frekwencję na wykładzie, wymaga obecności na kanale głosowym.
${commands.commandPrefix}${commands.raportCommand} - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym. 
    * W trybie restrykcyjnym lista generowana jest na podstawie listy studentów.
    * W trybie swobodnym lista generowana jest najpierw na podstawie pseudonimu a w przypadku jego braku, na podstawie nazwy użytkownika.
${commands.commandPrefix}${commands.infoCommand} - Wyświetla informacje o tym bocie.

Komendy administracyjne:
${commands.commandPrefix}${commands.addStudentCommand} "<IMIE NAZWISKO>" "<TAG DISCORDA>" - Dodaje studenta do listy studentów.
${commands.commandPrefix}${commands.removeStudentCommand} <TAG DISCORDA> - Usuwa studenta z listy studentów.
${commands.commandPrefix}${commands.checkStudentCommand} imie "<IMIE NAZWISKO>" | tag "<TAG DISCORDA>" - Sprawdza, czy student znajduje się na liście studentów.
${commands.commandPrefix}${commands.dumpCommand} - Wypisuje wszystkie osoby na liście studentów do pliku json.
${commands.commandPrefix}${commands.insertAllCommand} - Dodaje do listy studentów wszystkie osoby posiadające przynajmniej jedną z roli studenta, zwraca logi operacji załączone w pliku txt.
${commands.commandPrefix}${commands.cleanUpListCommand} - Czyści listę studentów z nieaktualnych tagów, powtórek tagów oraz powtórek imion i nazwisk (w tym podobnych imion i nazwisk). W przypadku napotkania powtórki usuwane są wszystkie powrórki.
${commands.commandPrefix}${commands.insertListCommand} - Aktualizuje listę studentów na podstawie załączonego pliku json (format taki sam jak uzyskany przy pomocy komendy ${commands.commandPrefix}${commands.dumpCommand})
${commands.commandPrefix}${commands.strictModeCommand} on|off - Włącza lub wyłącza tryb restrykcyjny (wstęp do kanałów głosowych tylko na podstawie listy studentów).

Ta wiadomość zniknie za 60 sekund...`
            ;
    }
    else if (roles.isPresenter(msg.member)) {
        msgStr =
            `
${commands.commandPrefix}${commands.helpCommand} - Wyświetla tą wiadomość.
${commands.commandPrefix}${commands.statusCommand} - Wyświetla aktualną frekwencję na wykładzie, wymaga obecności na kanale głosowym.
${commands.commandPrefix}${commands.raportCommand} - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym. 
    * W trybie restrykcyjnym lista generowana jest na podstawie listy studentów.
    * W trybie swobodnym lista generowana jest najpierw na podstawie pseudonimu a w przypadku jego braku, na podstawie nicku.
${commands.commandPrefix}${commands.infoCommand} - Wyświetla informacje o tym bocie.
    
Ta wiadomość zniknie za 60 sekund...`
            ;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 60000 });
    });
}

const replyStatus = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const channelID = msg.member.voice.channelID;
    const channel = client.channels.cache.get(channelID);

    const presentStudents = channel.members.filter(member => roles.isStudent(member));

    let totalStudents; 
    let msgStr;
    if(db.isStrictMode()){
        totalStudents = db.dumpAllStudents().length;
        msgStr =
        `${moment().tz(config["timezone"]).format('LLL')}
        Obecność: ${presentStudents.size}/${totalStudents} studentów na serwerowej liście studentów.`;
    }
    else{
        totalStudents = msg.member.guild.members.cache.filter((member) => {
            const memberTransformed = helpers.transformMember(member);
            return roles.isStudent(memberTransformed);
        });
        totalStudents = totalStudents.size;
        msgStr =
        `${moment().tz(config["timezone"]).format('LLL')}

Obecność: ${presentStudents.size}/${totalStudents} całkowitej ilości studentów na serwerze.`;
    }

    msg.reply(msgStr).then(() => {
        msg.delete();
    });
}

const replyRaport = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const presence = [];
    let cnt = 1;

    const channelID = msg.member.voice.channelID;
    const channel = client.channels.cache.get(channelID);

    let errLog = "";

    // for each member in voice channel
    channel.members.forEach(member => {
        const memberTransformed = helpers.transformMember(member); // for role.isX() functions

        if (roles.isStudent(memberTransformed)) {
            // if strict then fill presence list with data from database
            if (db.isStrictMode()) {
                try {
                    const student = db.getStudent(member.user.tag);
                    presence.push({ "id": cnt, "osoba": student.name, "tag": student.tag });
                }
                // student in voice channel not found in database
                catch (error) {
                    errLog +=
                        `
UWAGA: Użytkownik ${member.nickname}, ${member.user.username}, ${member.user.tag} nie znajduje się na liście studentów i pomimo załączonego trybu restrykcyjnego znajduje się na kanale głosowym. 
To nie powinno się zdarzyć.
Użytkownik dodany do listy obecnosci na podstawie pseudonimu lub nazwy użytkownika.`;

                    // add not found user based on it's nickname or username
                    const name = member.nickname ? member.nickname : member.user.username;
                    presence.push({ "id": cnt, "osoba": name, "tag": member.user.tag });
                }
            }
            // not strict mode - add user based on nickname or username
            else {
                const name = member.nickname ? member.nickname : member.user.username;
                presence.push({ "id": cnt, "osoba": name, "tag": member.user.tag });
            }
            cnt++;
        }
    });

    errLog += "\n";

    //create csv file
    const filename = "Wyklad_" + moment().tz(config["timezone"]).format('YYYY_MM_DD_HH_mm_ss') + ".csv";
    const csv = helpers.JSONtoCSV(presence);
    const bufSize = Buffer.byteLength(csv, 'utf8');
    const buf = Buffer.alloc(bufSize, 'utf8');
    buf.write(csv);

    const msgArr = [
        `
W załączniku znajduje się lista obecności.

Plik ma formę:
Liczba porządkowa, imię i nazwisko, tag Discord

UWAGA PLIK NALEŻY OTWORZYĆ W NOTATNIKU ZE WZGLĘDU NA TO, ŻE EXCEL NIE KODUJE DOBRZE POLSKICH ZNAKÓW.`
        , {
            "files": [{
                attachment: buf,
                name: filename
            }]
        }];

    msg.reply(errLog + msgArr[0], msgArr[1]).then(() => {
        msg.delete();
    });
}

const replyInfo = (msg, args) => {

    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const msgStr =
        `
Bot stworzony w celu sprawdzania obecności na zajęciach online na pierwszym semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki Politechniki Gdańskiej.
https://github.com/Tai-Min/Discord-Obecnosciobot

The MIT License

Copyright (c) 2020 Mateusz Pająk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 50000 });
    });
}

const replyAdd = (msg, args) => {
    if (args.length !== 2) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const name = args[0];
    const tag = args[1];

    let msgStr;
    if (db.addStudent(name, tag)) {
        msgStr = `Dodano ${name} do listy studentów.`;
    }
    else {
        const user = db.getStudent(tag);
        msgStr = `${tag} znajduje się już na liście studentów jako ${user.name}.`;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
}

const replyRemove = (msg, args) => {
    if (args.length !== 1) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const tag = args[0];

    let msgStr;
    if (!db.removeStudent(tag)) {
        msgStr = `${tag} nie znajduje się na liście studentów.`;
    }
    else {
        msgStr = `Osoba ${tag} została usunięta z listy studentów.`;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
}

const replyCheck = (msg, args) => {
    if (args.length !== 2) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    let msgStr;
    if (args[0] === "tag") {
        const tag = args[1];

        if (db.studentExists(tag)) {
            const student = db.getStudent(tag);
            msgStr = `${tag} znajduje się na liście studentów jako ${student.name}.`;
        }
        else {
            msgStr = `${tag} nie znajduje się na liście studentów.`;
        }
    }
    else if (args[0] === "imie") {
        const name = args[1];
        const student = db.getStudentBySimilarName(name);
        // no student found
        if (!student) {
            msgStr = `${name} nie znajduje się na liście studentów jako ${student.name}.`;
        }
        // multiple students with same name found
        else if (Array.isArray(student)) {
            msgStr = `${name} znajduje się na liście studentów jako:\n`;
            student.forEach((s) => {
                msgStr += `${s.tag} :  ${s.name}.\n`;
            })
        }
        // one student found
        else {
            msgStr = `${name} znajduje się na liście studentów jako ${student.tag}`;
        }
    }
    else {
        replyWarn(msg, "paramMismatch");
        return;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 10000 });
    });
}

const replyDump = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }
    const msgStr = "Lista studentów w załączniku:\n"

    const students = db.dumpAllStudents();
    const txt = JSON.stringify(students, null, '\t');
    const bufSize = Buffer.byteLength(txt, 'utf8');
    const buf = Buffer.alloc(bufSize, 'utf8');
    buf.write(txt);

    msg.reply(msgStr, {
        "files": [{
            attachment: buf,
            name: 'lista.json'
        }]
    }).then(() => {
        msg.delete();
    });
}

const replyInsertAll = (msg, args) => {

    const msgStr = "Uzupełniam listę studentów...\nLogi znajdują się w załączniku:";
    let log = "";
    msg.member.guild.members.cache.forEach(member => {
        let memberTransformed = helpers.transformMember(member);
        if (roles.isStudent(memberTransformed)) {
            let name = member.nickname ? member.nickname : member.user.username;
            log += `Dodaję ${name} : ${member.user.tag} do listy studentów...\n`;
            if (!db.addStudent(name, member.user.tag)) {
                let tempStudent = db.getStudent(member.user.tag);
                if (tempStudent.name === name) {
                    log += `Użytkownik ${name} : ${member.user.tag} istnieje już na liście.\n`
                }
                else {
                    log += `${member.user.tag} istnieje w bazie jako ${tempStudent.name}!\n`;
                }
            }
        }
    });

    const bufSize = Buffer.byteLength(log, 'utf8');
    const buf = Buffer.alloc(bufSize, 'utf8');
    buf.write(log);

    msg.reply(msgStr, {
        "files": [{
            attachment: buf,
            name: 'log.txt'
        }]
    }).then(() => {
        msg.delete();
    });
}

const replyCleanUpList = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const memberList = msg.member.guild.members.cache.array();
    const cleanList = db.getCleanStudentList();

    // remove students missing from server
    const readyList = cleanList.filter((student) => {
        for (let i = 0; i < memberList.length; i++) {
            if (student.tag === memberList[i].user.tag && roles.isStudent(memberList[i])) {
                return true;
            }
        }
        return false;
    })

    db.replaceStudentList(readyList);

    msg.reply("Lista wyczyszczona z powtórek i nieznalezionych tagów.").then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
}

const replyInsertList = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }
    if (msg.attachments.array().length != 1) {
        replyWarn(msg, "attachMismatch");
        return
    }

    const attachment = msg.attachments.array()[0];
    fetch(attachment.url)
        .then(res => res.json())
        .then(out => {
            db.replaceStudentList(out);
            msg.reply("Lista studentów została zmieniona.").then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 })
            });
        })
        .catch(err => {
            replyWarn(msg, "attachMismatch");
        })
}

const replyStrictMode = (msg, args) => {
    if (args.length !== 1) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const state = args[0].toLowerCase();

    if (state === "on") {
        db.setStrictMode(true);
        msg.reply("Restrykcje nałożone.").then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        return;
    }
    else if (state === "off") {
        db.setStrictMode(false);
        msg.reply("Restrykcje zdjęte.").then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        return;
    }
    else {
        replyWarn(msg, "paramMismatch");
        return;
    }
}

const replyWarn = (msg, type: String) => {
    switch (type) {
        case "voiceChanReq":
            msg.reply("Użycie tej komendy wymaga obecności na kanale głosowym.").then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 });
            });
            break;
        case "paramMismatch":
            msg.reply(`Nieprawidłowa ilość argumentów lub zły typ argumentu.\nUżyj ${commands.commandPrefix}${commands.helpCommand} po więcej informacji.`)
                .then((reply) => {
                    msg.delete();
                    reply.delete({ "timeout": 5000 });
                });
            break;
        case "attachMismatch":
            msg.reply(`Nieprawidłowa ilość załączników lub zły typ załącznika.\nUżyj ${commands.commandPrefix}${commands.helpCommand} po więcej informacji.`)
                .then((reply) => {
                    msg.delete();
                    reply.delete({ "timeout": 5000 });
                });
            break;
        default:
            msg.reply(`<<Coś poszło nie tak (replyWarn): ${type}>>`).then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 });
            });
            break;
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    if (!commands.hasPrefix(msg.content)) {
        return;
    }

    const commandString = commands.removePrefix(msg.content);
    const args = helpers.splitArgs(commandString); //sprlit string into array of arguments
    const commandName = args[0]; // get command name
    args.splice(0, 1); // get other args

    //user tried to use admin's command but is not allowed to
    if (commands.isAdminCommand(commandName) && !roles.isAdmin(msg.member)) {
        msg.delete();
        return;
    }
    //user tried to use presenter's command but is not allowed to
    else if (commands.isPresenterCommand(commandName) && !roles.isPresenter(msg.member) && !roles.isAdmin(msg.member)) {
        msg.delete();
        return;
    }
    //not a valid command, maybe for other bots so ignore it
    else if (!commands.isCommand(commandName)) {
        return;
    }

    //chech whether user tries to use command that requires presence in voice channel
    //i.e to check presence status
    const channelID = msg.member.voice.channelID;
    if (!channelID && commands.requiresVoiceChannel(commandName)) {
        replyWarn(msg, "voiceChanReq");
        return;
    }

    //user is allowed to use command so perform it
    switch (commandName) {
        case commands.raportCommand:
            replyRaport(msg, args);
            break;
        case commands.statusCommand:
            replyStatus(msg, args);
            break;
        case commands.helpCommand:
            replyHelp(msg, args);
            break;
        case commands.infoCommand:
            replyInfo(msg, args);
            break;
        case commands.addStudentCommand:
            replyAdd(msg, args);
            break;
        case commands.removeStudentCommand:
            replyRemove(msg, args);
            break;
        case commands.checkStudentCommand:
            replyCheck(msg, args);
            break;
        case commands.strictModeCommand:
            replyStrictMode(msg, args);
            break;
        case commands.dumpCommand:
            replyDump(msg, args);
            break;
        case commands.insertAllCommand:
            replyInsertAll(msg, args);
            break;
        case commands.cleanUpListCommand:
            replyCleanUpList(msg, args);
            break;
        case commands.insertListCommand:
            replyInsertList(msg, args);
            break
        default:
            msg.reply(`<<Coś poszło nie tak: ${commandName}>>`);
            break;
    }
});



client.on('voiceStateUpdate', (oldMember, newMember) => {

    const newUserChannel = newMember.channelID // currently joined channel
    const oldUserChannel = oldMember.channelID // previous channel

    // user Joins a voice channel
    if (!oldUserChannel && newUserChannel) {

        const guild = newMember.guild;
        const member = guild.members.cache.get(newMember.id)
        const tag = member.user.username + "#" + member.user.discriminator;
        const name = member.nickname ? member.nickname : member.user.username;
        const memberTransformed = helpers.transformMember(member); // for roles.isX() functions

        // presenter joins a voice channel for the first time
        if (roles.isPresenter(memberTransformed) && !db.presenterExists(tag)) {
            db.addPresenter(name, tag);
            member.send(
                `Szanowny Panie.

Miło mi powitać Pana na serwerze ${guild.name}.
Jestem automatem umożliwiającym kontrolę obecności słuchaczy podczas zajęć prowadzonych na platformie Discord.
Aby dokonać sprawdzenia obecności należy na dostępnym kanale tekstowym (np. #wykład) wpisać komendę "${commands.commandPrefix}${commands.raportCommand}".
Dodatkowo, serwer umożliwia sprawdzenie aktualnej frekwencji przy pomocy komendy "${commands.commandPrefix}${commands.statusCommand}".
W celu uzyskania pomocy dostępna jest komenda "${commands.commandPrefix}${commands.helpCommand}".
Informacje o automacie dostępne są pod komendą "${commands.commandPrefix}${commands.infoCommand}".
W przypadku pytań proszę kierować się do administratorów serwera.

Z wyrazami szacunku,
${client.user.username}`
            );
        }
        // not registered student tries to join a voice channel with strict mode enabled
        else if (roles.isStudent(memberTransformed) && !roles.isAdmin(memberTransformed) && !db.studentExists(tag) && db.isStrictMode()) {
            member.send(
                `Ups...

Serwer jest obecnie w trybie restrykcyjnym i wygląda na to, że nie jesteś wpisany na listę studentów.
Ze względu na to, usunęłam twoją rangę studenta.
W przypadku pomyłki skontaktuj się z administracją.`
                , { "files": ["./user_kicked.png"] })
            newMember.kick("Nie na liście studentów.");
            member.roles.remove(member.roles.cache); // degrade user to lowest range
        }
        else if (roles.isStudent(memberTransformed) && roles.isAdmin(memberTransformed) && !db.studentExists(tag) && db.isStrictMode()) {
            member.send(
                `Ups...

Serwer jest obecnie w trybie restrykcyjnym i wygląda na to, że nie jesteś wpisany na listę studentów.
Twoja obecność nie zostanie uwzględniona w pliku obecności.
Ze względu na posiadaną przez Ciebie rangę, nie mam możliwości zdjęcia ci rangi studenta.
Przed dołączeniem do wykładu zalecam dodać siebie do listy studentów za pomocą komendy ${commands.commandPrefix}${commands.addStudentCommand} "<IMIE NAZWISKO>" "<TAG DISCORDA>".
`
                , { "files": ["./user_kicked.png"] })
        }
    }
})

client.login(config["token"]);