var Discord = require('discord.js');
var moment = require('moment');
var config = require('./config.json');
moment.locale('pl');
var client = new Discord.Client();
var commandPrefix = config["commandPrefix"];
var generateReportCommand = config["reportCommand"];
var statusCommand = config["statusCommand"];
var helpCommand = config["helpCommand"];
var infoCommand = config["infoCommand"];
var commands = [generateReportCommand, statusCommand, helpCommand, infoCommand];
var allowedRoles = config["allowedRoles"];
var studentRoles = config["studentRoles"];
var presenterRoles = config["presenterRoles"];
var isAllowed = function (member) {
    for (var i = 0; i < allowedRoles.length; i++) {
        if (member.roles.cache.some(function (role) { return role.name === allowedRoles[i]; })) {
            return true;
        }
    }
    return false;
};
var isStudent = function (member) {
    if (member.bot === true)
        return false;
    for (var i = 0; i < studentRoles.length; i++) {
        if (member.roles.cache.some(function (role) { return role.name === presenterRoles[i]; })) {
            return false;
        }
    }
    for (var i = 0; i < studentRoles.length; i++) {
        if (member.roles.cache.some(function (role) { return role.name === studentRoles[i]; })) {
            return true;
        }
    }
    return false;
};
var isCommand = function (msg) {
    if (commands.includes(msg.toString()))
        return true;
    return false;
};
var isValidCommand = function (msg) {
    if (msg.length === 0) {
        return false;
    }
    if (msg[0] !== commandPrefix) {
        return false;
    }
    if (!isCommand(msg.slice(1, msg.length).trim())) {
        return false;
    }
    return true;
};
var transformMember = function (member, guild) {
    var memberTransformed = {
        "roles": {
            "cache": member._roles.map(function (roleId) {
                return guild.roles.cache.get(roleId);
            })
        },
        "bot": member.user.bot
    };
    return memberTransformed;
};
var getStatusMsg = function (guild, channel) {
    var presentStudents = channel.members.filter(function (member) { return isStudent(member); });
    var totalStudents = guild.members.cache.filter(function (member) {
        var memberTransformed = transformMember(member, guild);
        return isStudent(memberTransformed);
    });
    var str = "\n    " + moment().format('LLL') + "\n    Obecno\u015B\u0107: " + presentStudents.size + "/" + totalStudents.size + " ca\u0142kowitej ilo\u015Bci student\u00F3w na serwerze.\n    ";
    return str;
};
var JSONtoCSV = function (data) {
    var csv = data.map(function (d) {
        return JSON.stringify(Object.values(d));
    })
        .join('\n')
        .replace(/(^\[)|(\]$)|(\")/mg, '');
    return csv;
};
var getReportMessage = function (guild, channel) {
    var presence = [];
    var cnt = 1;
    channel.members.forEach(function (member) {
        var memberTransformed = transformMember(member, guild);
        if (isStudent(memberTransformed)) {
            if (member.nickname === null || member.nickname === undefined)
                presence.push({ "id": cnt, "osoba": member.user.username });
            else
                presence.push({ "id": cnt, "osoba": member.nickname });
            cnt++;
        }
    });
    var csv = JSONtoCSV(presence);
    var bufSize = csv.length;
    var buf = Buffer.alloc(bufSize);
    var filename = "Wyklad_" + moment().format('YYYY_MM_DD_HH_mm_ss') + ".csv";
    buf.write(csv);
    return ["\nW załączniku znajduje się lista obecności:", { "files": [{
                    attachment: buf,
                    name: filename
                }] }];
};
var getHelpMsg = function () {
    return "\n    " + commandPrefix + helpCommand + " - Wy\u015Bwietla t\u0105 wiadomo\u015B\u0107.\n    " + commandPrefix + statusCommand + " - Wy\u015Bwietla aktualn\u0105 obecno\u015B\u0107 na wyk\u0142adzie, wymaga obecno\u015Bci na kanale g\u0142osowym.\n    " + commandPrefix + generateReportCommand + " - Generuje plik csv z obecno\u015Bci\u0105, wymaga obecno\u015Bci na kanale g\u0142osowym.\n    " + commandPrefix + "info - Wy\u015Bwietla informacje o tym bocie.\n\n    Ta wiadomo\u015B\u0107 zniknie za 20 sekund...\n    ";
};
var getInfoMsg = function () {
    return "\nBot stworzony w celu sprawdzenia obecno\u015Bci na zaj\u0119ciach online na pierwszym semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki na Politechnice Gda\u0144skiej\nhttps://github.com/Tai-Min\n\nThe MIT License\n\nCopyright 2020 Mateusz Paj\u0105k\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n    ";
};
client.on('ready', function () {
    console.log("Logged in as " + client.user.tag + "!");
});
client.on('message', function (msg) {
    if (isValidCommand(msg.content)) {
        if (!isAllowed(msg.member)) {
            msg["delete"]();
            return;
        }
        var content = msg.content.slice(1, msg.content.length);
        var channelID = msg.member.voice.channelID;
        if ((channelID === null || channelID === undefined) && content != helpCommand && content != infoCommand) {
            msg.reply("Użycie tej komendy wymaga obecności na kanale głosowym").then(function (reply) {
                msg["delete"]();
                reply["delete"]({ "timeout": 5000 });
            });
            return;
        }
        var channel = client.channels.cache.get(channelID);
        var guild = client.guilds.cache.get(msg.member.guild.id);
        switch (content) {
            case generateReportCommand:
                var report = getReportMessage(guild, channel);
                msg.reply(report[0], report[1]).then(function (reply) {
                    msg["delete"]();
                });
                break;
            case statusCommand:
                msg.reply(getStatusMsg(guild, channel)).then(function (reply) {
                    msg["delete"]();
                });
                break;
            case helpCommand:
                //reply with help message and delete sender's message
                //then delete help message after some time
                msg.reply(getHelpMsg()).then(function (reply) {
                    msg["delete"]();
                    reply["delete"]({ "timeout": 20000 });
                });
                break;
            case infoCommand:
                msg.reply(getInfoMsg()).then(function (reply) {
                    msg["delete"]();
                    reply["delete"]({ "timeout": 35000 });
                });
                break;
            default:
                msg.reply("Undefined error");
                break;
        }
    }
});
client.login(config["token"]);
