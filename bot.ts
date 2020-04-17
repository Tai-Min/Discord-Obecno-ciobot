const Discord = require('discord.js');
const moment = require('moment-timezone');
const config = require('./config/config.json');
var accents = require('remove-accents');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/db.json')
const db = low(adapter);

moment.locale('pl');
db.defaults({ students: [], presenters: [], strict_mode: false }).write();

const client = new Discord.Client();

const commandPrefix = config["commandPrefix"];
const raportCommand = config["raportCommand"];
const statusCommand = config["statusCommand"];
const helpCommand = config["helpCommand"];
const infoCommand = config["infoCommand"];
const addStudentCommand = config["addStudentCommand"];
const removeStudentCommand = config["removeStudentCommand"];
const checkStudentCommand = config["checkStudentCommand"];
const strictModeCommand = config["strictModeCommand"];

const presenterCommands = [helpCommand, raportCommand, infoCommand, statusCommand];
const adminCommands = [addStudentCommand, removeStudentCommand, checkStudentCommand, strictModeCommand];
const allCommands = presenterCommands.concat(adminCommands);
const voiceChannelRequiredCommands = [raportCommand, statusCommand];

const presenterRoles = config["presenterRoles"];
const adminRoles = config["adminRoles"];
const studentRoles = config["studentRoles"];

const isPresenter = (member) => {
    if (member.bot === true)
        return false;

    for (var i = 0; i < presenterRoles.length; i++) {
        if (member.roles.cache.some(role => role.name === presenterRoles[i])) {
            return true;
        }
    }
    return false;
}

const isAdmin = (member) => {
    if (member.bot === true)
        return false;

    for (var i = 0; i < adminRoles.length; i++) {
        if (member.roles.cache.some(role => role.name === adminRoles[i])) {
            return true;
        }
    }
    return false;
}

const isStudent = (member) => {
    if (member.bot === true)
        return false;

    for (var i = 0; i < studentRoles.length; i++) {
        if (member.roles.cache.some(role => role.name === studentRoles[i])) {
            return true;
        }
    }
    return false;
}

const isCommand = (msg: String) => {
    if (allCommands.includes(msg.toString()))
        return true;
    return false;
}

const isAdminCommand = (msg: String) => {
    if (adminCommands.includes(msg.toString()))
        return true;
    return false;
}

const isPresenterCommand = (msg: String) => {
    if (presenterCommands.includes(msg.toString()))
        return true;
    return false;
}

const requiresVoiceChannel = (msg: String) => {
    if (voiceChannelRequiredCommands.includes(msg.toString()))
        return true;
    return false;
}

const hasPrefix = (msg: String) => {
    if (msg.length === 0) {
        return false;
    }
    if (msg[0] !== commandPrefix) {
        return false;
    }
    return true;
}

const removePrefix = (command: String) => {
    return command.slice(1, command.length);
}

const transformMember = (member, guild) => {
    var memberTransformed = {
        "roles": {
            "cache": member._roles.map((roleId) => {
                return guild.roles.cache.get(roleId);
            })
        },
        "bot": member.user.bot
    }
    return memberTransformed;
}

const JSONtoCSV = (data) => {
    var csv = data.map(function (d) {
        return JSON.stringify(Object.values(d));
    })
        .join('\n')
        .replace(/(^\[)|(\]$)|(\")/mg, '');
    return csv;
}

const replyAdd = (msg, args) => {
    if (args.length !== 2) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var person = args[0];
    var tag = args[1];
    var personFixed = accents.remove(person.toLowerCase());

    var msgStr;
    if (!db.get("students").find({ name: personFixed, tag: tag }).value()) {
        db.get("students").push({ name: personFixed, tag: tag }).write();
        msgStr = `Dodano ${person} do listy studentów.`;
    }
    else {
        msgStr = `${person} znajduje się już na liście studentów.`;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
}

const replyRemove = (msg, args) => {
    if (args.length !== 2) {
        replyWarn(msg, "paramMismatch");
        return;
    }
    var person = args[0];
    var tag = args[1];
    var personFixed = accents.remove(person.toLowerCase());

    var msgStr;
    if (!db.get("students").find({ name: personFixed, tag: tag }).value()) {
        msgStr = `${person} nie znajduje się na liście studentów.`;
    }
    else {
        db.get("students").remove({ name: personFixed, tag: tag }).write();
        msgStr = `Osoba ${person} została usunięta z listy studentów.`;
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

    var person = args[0];
    var tag = args[1];
    var personFixed = accents.remove(person.toLowerCase());

    var msgStr;
    if (db.get("students").find({ name: personFixed, tag: tag }).value()) {
        msgStr = `${person} znajduje się na liście studentów.`
    }
    else {
        msgStr = `${person} nie znajduje się na liście studentów.`
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
}

const replyStatus = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var channelID = msg.member.voice.channelID;
    var channel = client.channels.cache.get(channelID);
    var guild = client.guilds.cache.get(msg.member.guild.id);

    var presentStudents = channel.members.filter(member => isStudent(member));

    var totalStudents = guild.members.cache.filter((member) => {
        var memberTransformed = transformMember(member, guild);
        return isStudent(memberTransformed);
    });

    var msgStr = `
    ${moment().tz('Europe/Warsaw').format('LLL')}
    Obecność: ${presentStudents.size}/${totalStudents.size} całkowitej ilości studentów na serwerze.
    `;

    msg.reply(msgStr).then(() => {
        msg.delete();
    });
}

const replyRaport = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var presence = [];
    var cnt = 1;

    var channelID = msg.member.voice.channelID;
    var channel = client.channels.cache.get(channelID);
    var guild = client.guilds.cache.get(msg.member.guild.id);

    channel.members.forEach(member => {
        var memberTransformed = transformMember(member, guild);
        if (isStudent(memberTransformed)) {
            if (member.nickname === null || member.nickname === undefined)
                presence.push({ "id": cnt, "osoba": member.user.username, "tag": member.user.tag });
            else
                presence.push({ "id": cnt, "osoba": member.nickname, "tag": member.user.tag });
            cnt++;
        }
    });


    var csv = JSONtoCSV(presence);

    var bufSize = Buffer.byteLength(csv, 'utf8');
    var buf = Buffer.alloc(bufSize, 'utf8');
    var filename = "Wyklad_" + moment().tz('Europe/Warsaw').format('YYYY_MM_DD_HH_mm_ss') + ".csv";

    buf.write(csv);
    var msgArr = [`
    W załączniku znajduje się lista obecności.

    Plik ma formę:
    Liczba porządkowa, imię i nazwisko, tag Discord

    UWAGA PLIK NALEŻY OTWORZYĆ W NOTATNIKU ZE WZGLĘDU NA TO, ŻE EXCEL NIE KODUJE DOBRZE POLSKICH ZNAKÓW.
    `, {
            "files": [{
                attachment: buf,
                name: filename
            }]
        }];

    msg.reply(msgArr[0], msgArr[1]).then(() => {
        msg.delete();
    });
}

const replyHelp = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var msgStr = "<<Coś poszło nie tak (replyHelp)>>";
    if (isAdmin(msg.member)) {
        msgStr = `
        ${commandPrefix}${helpCommand} - Wyświetla tą wiadomość.
        ${commandPrefix}${statusCommand} - Wyświetla aktualną obecność na wykładzie, wymaga obecności na kanale głosowym.
        ${commandPrefix}${raportCommand} - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym.
        ${commandPrefix}${addStudentCommand} <IMIE NAZWISKO> <TAG DISCORDA> - Dodaje studenta do listy studentów.
        ${commandPrefix}${removeStudentCommand} <IMIE NAZWISKO> <TAG DISCORDA> - Usuwa studenta z listy studentów.
        ${commandPrefix}${checkStudentCommand} <IMIE NAZWISKO> <TAG DISCORDA> - Sprawdza, czy student znajduje się na liście studentów.
        ${commandPrefix}${strictModeCommand} on|off - Włącza lub wyłącza tryb restrykcyjny.
        ${commandPrefix}${infoCommand} - Wyświetla informacje o tym bocie.
    
        Ta wiadomość zniknie za 20 sekund...
        `;
    }
    else if (isPresenter(msg.member)) {
        msgStr = `
        ${commandPrefix}${helpCommand} - Wyświetla tą wiadomość.
        ${commandPrefix}${statusCommand} - Wyświetla aktualną obecność na wykładzie, wymaga obecności na kanale głosowym.
        ${commandPrefix}${raportCommand} - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym.
        ${commandPrefix}${infoCommand} - Wyświetla informacje o tym bocie.
    
        Ta wiadomość zniknie za 20 sekund...
        `;
    }


    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 20000 });
    });
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
            msg.reply(`Nieprawidłowa ilość argumentów.\nUżyj ${commandPrefix}${helpCommand} po więcej informacji.`)
                .then((reply) => {
                    msg.delete();
                    reply.delete({ "timeout": 5000 });
                });
            break;
        case "studentsDBProblem":
            msg.reply(`Coś jest nie tak z bazą studentów.`)
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

const replyInfo = (msg, args) => {

    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var msgStr = `
Bot stworzony w celu sprawdzania obecności na zajęciach online na pierwszym semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki Politechniki Gdańskiej.
https://github.com/Tai-Min/Discord-Obecnosciobot

The MIT License

Copyright (c) 2020 Mateusz Pająk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    `;

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 35000 });
    });
}

const replyStrictMode = (msg, args) =>{
    if (args.length !== 1) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    var state = args[0].toLowerCase();
    console.log(state)
    if(state === "on"){
        setStrictMode(true);
        msg.reply("Restrykcje nałożone.").then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        return;
    }
    else if(state === "off"){
        setStrictMode(false);
        msg.reply("Restrykcje zdjęte.").then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        return;
    }
    else{
        replyWarn(msg, "paramMismatch");
        return;
    }
}

const splitArgs = (argStr) => {
    var aStr = argStr.match(/\w+|"[^"]+"/g), i = aStr.length;
    while (i--) {
        aStr[i] = aStr[i].replace(/"/g, "");
    }
    return aStr;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    if (!hasPrefix(msg.content)) {
        return;
    }

    var commandString = removePrefix(msg.content);
    var args = splitArgs(commandString);
    var commandName = args[0];//get command name
    args.splice(0, 1);//get other args

    //user tried to use manage command but is not allowed to
    if (isAdminCommand(commandName) && !isAdmin(msg.member)) {
        msg.delete();
        return;
    }
    //user tried to use general command but is not allowed to
    else if (isPresenterCommand(commandName) && !isPresenter(msg.member) && !isAdmin(msg.member)) {
        msg.delete();
        return;
    }
    //not a valid command, maybe for other bots
    else if (!isCommand(commandName)) {
        return;
    }

    //chech whether user tries to use command that requires presence in voice channel
    //i.e to check presence status
    var channelID = msg.member.voice.channelID;
    if ((channelID === null || channelID === undefined) && requiresVoiceChannel(commandName)) {
        replyWarn(msg, "voiceChanReq");
        return;
    }

    //user is allowed to use given command so perform it
    switch (commandName) {
        case raportCommand:
            replyRaport(msg, args);
            break;
        case statusCommand:
            replyStatus(msg, args);
            break;
        case helpCommand:
            replyHelp(msg, args);
            break;
        case infoCommand:
            replyInfo(msg, args);
            break;
        case addStudentCommand:
            replyAdd(msg, args);
            break;
        case removeStudentCommand:
            replyRemove(msg, args);
            break;
        case checkStudentCommand:
            replyCheck(msg, args);
            break;
            case strictModeCommand:
            replyStrictMode(msg, args);
            break
        default:
            msg.reply(`<<Coś poszło nie tak: ${commandName}>>`);
            break;
    }
});

const studentExists = (name, tag) => {
    if (!db.get("students").find({ tag: tag }).value())
        return false;
    return true;
}

const presenterExists = (name, tag) => {
    if (!db.get("presenters").find({ tag: tag }).value())
        return false;
    return true;
}

const addPresenter = (name, tag) => {
    db.get("presenters").push({ name: name, tag: tag }).write();
}

const isStrictMode = () =>{
    if (!db.get("strict_mode").value()){
        return false
    };
    return true;
}

const setStrictMode = (value) =>{
    db.set("strict_mode", value).write();
}

client.on('voiceStateUpdate', (oldMember, newMember) => {

    let newUserChannel = newMember.channelID
    let oldUserChannel = oldMember.channelID



    if (!oldUserChannel && newUserChannel) {
        // User Joins a voice channel
        var guild = newMember.guild;
        var member = guild.members.cache.get(newMember.id)
        var name = member.user.username;
        var tag = member.user.username + "#" + member.user.discriminator;

        if (member.nickname) {
            name = member.nickname;
        }
        var memberTransformed = transformMember(member, guild);

        if (isPresenter(memberTransformed) && !presenterExists(name, tag)) {
            addPresenter(name, tag);

            member.send(`
            Szanowny ${name}.

Miło mi powitać Pana na serwerze ${guild.name}.
Jestem automatem umożliwiającym kontrolę obecności słuchaczy podczas zajęć prowadzonych na platformie Discord.
Aby dokonać sprawdzenia obecności należy na dostępnym kanale tekstowym (np. #wykład) wpisać komendę "${commandPrefix}${raportCommand}".
Dodatkowo, serwer umożliwia sprawdzenie aktualnej frekwencji przy pomocy komendy "${commandPrefix}${statusCommand}".
W celu uzyskania pomocy dostępna jest komenda "${commandPrefix}${helpCommand}".
Informacje o automacie dostępne są pod komendą "${commandPrefix}${infoCommand}".
W przypadku pytań proszę kierować się do administratorów serwera.

Z wyrazami szacunku,
${client.user.username}
            `);
        }
        else if(isStudent(memberTransformed) /*&& !isAdmin(memberTransformed)*/ && !studentExists(name, tag) && isStrictMode()){
            member.send(`
            Ups...

Wygląda na to, że nie jesteś wpisany na listę studentów.
W przypadku pomyłki skontaktuj się z administracją.
            `, {"files":["./user_kicked.png"]})
            newMember.kick("Nie na liście studentów.");
            member.roles.remove(member.roles.cache);
        }



    } else if (!newUserChannel) {
        // User leaves a voice channel
    }
})

client.login(config["token"]);