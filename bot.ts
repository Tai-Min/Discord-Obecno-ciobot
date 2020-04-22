const Discord = require('discord.js');
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const config = require('./config/config.json');
import { helpers } from './helpers';
import { commands } from './commands';
import { db } from './db';
import { roles } from './roles';
import { msgs } from './msgs';

moment.locale('pl');

const client = new Discord.Client();

const replyHelp = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const replacements = {
        "%COMMAND_PREFIX%": commands.commandPrefix, "%HELP_COMMAND%": commands.helpCommand,
        "%STATUS_COMMAND%": commands.statusCommand, "%RAPORT_COMMAND%": commands.raportCommand,
        "%INFO_COMMAND%": commands.infoCommand, "%ADD_STUDENT_COMMAND%": commands.addStudentCommand,
        "%REMOVE_STUDENT_COMMAND%": commands.removeStudentCommand, "%CHECK_STUDENT_COMMAND%": commands.checkStudentCommand,
        "%DUMP_COMMAND%": commands.dumpCommand, "%INSERT_ALL_COMMAND%": commands.insertAllCommand,
        "%CLEANUP_COMMAND%": commands.cleanUpListCommand, "%INSERT_LIST_COMMAND%": commands.insertListCommand,
        "%STRICT_MODE_COMMAND%": commands.strictModeCommand, "%NAME_PARAM%": msgs.checkName
    }

    let msgStr = msgs.errorMsg;
    if (roles.isAdmin(msg.member)) {
        msgStr = helpers.replaceMatches(msgs.adminHelp, replacements);
    }
    else if (roles.isPresenter(msg.member)) {
        msgStr = helpers.replaceMatches(msgs.presenterHelp, replacements);
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
    let msgStr = `${moment().tz(config["timezone"]).format('LLL')}\n`;
    if (db.isStrictMode()) {
        totalStudents = db.dumpAllStudents().length;
        const replacements = { "%PRESENT_STUDENTS%": presentStudents.size, "%TOTAL_STUDENTS%": totalStudents }
        msgStr += helpers.replaceMatches(msgs.statusMsgStrict, replacements);
    }
    else {
        totalStudents = msg.member.guild.members.cache.filter((member) => {
            const memberTransformed = helpers.transformMember(member);
            return roles.isStudent(memberTransformed);
        });
        totalStudents = totalStudents.size;
        const replacements = { "%PRESENT_STUDENTS%": presentStudents.size, "%TOTAL_STUDENTS%": totalStudents }
        msgStr += helpers.replaceMatches(msgs.statusMsg, replacements);
    }

    msg.reply(msgStr).then(() => {
        msg.delete();
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.statusCommand}): ` + msgStr);
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
                    presence.push({ "id": cnt, "person": student.name, "tag": student.tag });
                }
                // student in voice channel not found in database
                catch (error) {
                    const replacements = { "%NICKNAME%": member.nickname, "%USERNAME%": member.user.username, "%TAG%": member.user.tag }
                    errLog += helpers.replaceMatches(msgs.raportErrorLog, replacements) + "\n";

                    // so add not found user based on it's nickname or username
                    const name = member.nickname ? member.nickname : member.user.username;
                    presence.push({ "id": cnt, "person": name, "tag": member.user.tag });
                }
            }
            // not strict mode - add user based on nickname or username
            else {
                const name = member.nickname ? member.nickname : member.user.username;
                presence.push({ "id": cnt, "person": name, "tag": member.user.tag });
            }
            cnt++;
        }
    });

    errLog += "\n";

    if (errLog.length > 1800) {
        errLog = msgs.raportErrorLogShort + "\n";
    }
    //create csv file
    const filename = msgs.raportFilePrefix + "_" + moment().tz(config["timezone"]).format('YYYY_MM_DD_HH_mm_ss') + ".csv";
    const csv = helpers.JSONtoCSV(presence);
    const bufSize = Buffer.byteLength(csv, 'utf8');
    const buf = Buffer.alloc(bufSize, 'utf8');
    buf.write(csv);

    const msgArr = [msgs.raportMsg, {
        "files": [{
            attachment: buf,
            name: filename
        }]
    }];

    msg.reply(errLog + msgArr[0], msgArr[1]).then(() => {
        msg.delete();
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.raportCommand}): ` + errLog + msgArr[0], msgArr[1]);
}

const replyInfo = (msg, args) => {

    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const msgStr = msgs.infoMsg;

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 60000 });
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
        const replacements = { "%NAME%": name }
        msgStr = helpers.replaceMatches(msgs.addAddedMsg, replacements);
    }
    else {
        const user = db.getStudent(tag);
        const replacements = { "%TAG%": tag, "%NAME%": user.name }
        msgStr = helpers.replaceMatches(msgs.addExistsMsg, replacements);
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.addStudentCommand}): ` + msgStr);
}

const replyRemove = (msg, args) => {
    if (args.length !== 1) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    const tag = args[0];

    let msgStr;
    if (!db.removeStudent(tag)) {
        const replacements = { "%TAG%": tag }
        msgStr = helpers.replaceMatches(msgs.removeNotExistsMsg, replacements);
    }
    else {
        const replacements = { "%TAG%": tag }
        msgStr = helpers.replaceMatches(msgs.removeRemovedMsg, replacements);
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.removeStudentCommand}): ` + msgStr);
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
            const replacements = { "%TAG%": tag, "%NAME%": student.name }
            msgStr = helpers.replaceMatches(msgs.checkExistTagMsg, replacements);
        }
        else {
            const replacements = { "%TAG%": tag }
            msgStr = helpers.replaceMatches(msgs.checkNotExistsTagMsg, replacements);
        }
    }
    else if (args[0] === msgs.checkName) {
        const name = args[1];
        const student = db.getStudentBySimilarName(name);
        // no student found
        if (!student.length) {
            const replacements = { "%NAME%": name }
            msgStr = helpers.replaceMatches(msgs.checkNotExistsNameMsg, replacements);
        }
        // one student found
        else if (student.length === 1) {
            const replacements = { "%NAME%": name, "%TAG%": student[0].tag }
            msgStr = helpers.replaceMatches(msgs.checkExistsNameMsg, replacements);
        }
        // multiple students found
        else {
            const replacements = { "%NAME%": name }
            msgStr = helpers.replaceMatches(msgs.checkExistsMultipleNameMsg, replacements) + "\n";
            student.forEach((s) => {
                msgStr += `${s.tag} :  ${s.name}.\n`;
            })
            if (msgStr.length > 1800) {
                msgStr = msgs.checkExistsMultipleNameShortMsg;
            }
        }
    }
    else {
        replyWarn(msg, "paramMismatch");
        return;
    }

    msg.reply(msgStr).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 60000 });
    });
}

const replyDump = (msg, args) => {
    if (args.length !== 0) {
        replyWarn(msg, "paramMismatch");
        return;
    }
    const msgStr = msgs.dumpMsg;

    const students = db.dumpAllStudents();
    const txt = JSON.stringify(students, null, '\t');
    const bufSize = Buffer.byteLength(txt, 'utf8');
    const buf = Buffer.alloc(bufSize, 'utf8');
    buf.write(txt);

    msg.reply(msgStr, {
        "files": [{
            attachment: buf,
            name: msgs.dumpFilename + '.json'
        }]
    }).then(() => {
        msg.delete();
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.dumpCommand}): ` + msgStr, {
        "files": [{
            attachment: buf,
            name: msgs.dumpFilename + '.json'
        }]
    });
}

const replyInsertAll = (msg, args) => {

    const msgStr = msgs.insertAllMsg;
    let log = "";
    msg.member.guild.members.cache.forEach(member => {
        let memberTransformed = helpers.transformMember(member);
        if (roles.isStudent(memberTransformed)) {
            let name = member.nickname ? member.nickname : member.user.username;
            const replacements = { "%NAME%": name, "%TAG%": member.user.tag }
            log += helpers.replaceMatches(msgs.insertAllAddingMsg, replacements) + "\n";
            if (!db.addStudent(name, member.user.tag)) {
                let tempStudent = db.getStudent(member.user.tag);
                if (tempStudent.name === name) {
                    const replacements = { "%NAME%": name, "%TAG%": member.user.tag }
                    log += helpers.replaceMatches(msgs.insertAllExistsMsg, replacements) + "\n";
                }
                else {
                    const replacements = { "%NAME%": tempStudent.name, "%TAG%": member.user.tag }
                    log += helpers.replaceMatches(msgs.insertAllExistsTagMsg, replacements) + "\n";
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
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.insertAllCommand}): ` + msgStr, {
        "files": [{
            attachment: buf,
            name: 'log.txt'
        }]
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

    msg.reply(msgs.cleanupMsg).then((reply) => {
        msg.delete();
        reply.delete({ "timeout": 5000 });
    });
    msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.cleanUpListCommand}): ` + msgs.cleanupMsg);
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
            if (!Array.isArray(out)) {
                replyWarn(msg, "attachMismatch");
                return;
            }
            for (let i = 0; i < out.length; i++) {
                if (out[i] === undefined || out[i] === null || out[i].constructor !== Object) {
                    replyWarn(msg, "attachMismatch");
                    return;
                }
                if (Object.keys(out[i]).length !== 2) {
                    replyWarn(msg, "attachMismatch");
                    return;
                }
                if (!out[i].hasOwnProperty('name') || !out[i].hasOwnProperty('tag')) {
                    replyWarn(msg, "attachMismatch");
                    return;
                }
                if (typeof (out[i].name) !== "string" || typeof (out[i].tag) !== "string") {
                    replyWarn(msg, "attachMismatch");
                    return;
                }
            }
            db.replaceStudentList(out);
            msg.reply(msgs.insertMsg).then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 })
            });
            msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.insertListCommand}): ` + msgs.insertMsg);
        })
        .catch(err => {
            replyWarn(msg, "attachMismatch");
            return;
        })
}

const replyStrictMode = (msg, args) => {
    if (args.length > 1) {
        replyWarn(msg, "paramMismatch");
        return;
    }

    if (args.length === 0) {
        if (db.isStrictMode()) {
            msg.reply(msgs.strictStateOnMsg).then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 });
            });
            msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.strictModeCommand}): ` + msgs.strictStateOnMsg);
            return;
        }
        else {
            msg.reply(msgs.strictStateOffMsg).then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 });
            });
            msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.strictModeCommand}): ` + msgs.strictStateOffMsg);
            return;
        }
    }
    const state = args[0].toLowerCase();

    if (state === "on") {
        db.setStrictMode(true);
        msg.reply(msgs.strictEnabledMsg).then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.strictModeCommand}): ` + msgs.strictEnabledMsg);
        return;
    }
    else if (state === "off") {
        db.setStrictMode(false);
        msg.reply(msgs.strictDisabledMsg).then((reply) => {
            msg.delete();
            reply.delete({ "timeout": 5000 });
        });
        msg.guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (${commands.strictModeCommand}): ` + msgs.strictDisabledMsg);
        return;
    }
    else {
        replyWarn(msg, "paramMismatch");
        return;
    }
}

const replyWarn = (msg, type: String) => {
    const replacements = { "%COMMAND_PREFIX%": commands.commandPrefix, "%HELP_COMMAND%": commands.helpCommand }
    switch (type) {
        case "voiceChanReq":
            msg.reply(msgs.warnVoice).then((reply) => {
                msg.delete();
                reply.delete({ "timeout": 5000 });
            });
            break;
        case "paramMismatch":
            msg.reply(helpers.replaceMatches(msgs.warnParam, replacements))
                .then((reply) => {
                    msg.delete();
                    reply.delete({ "timeout": 5000 });
                });
            break;
        case "attachMismatch":
            msg.reply(helpers.replaceMatches(msgs.warnAttach, replacements))
                .then((reply) => {
                    msg.delete();
                    reply.delete({ "timeout": 5000 });
                });
            break;
        default:
            msg.reply(msgs.errorMsg).then((reply) => {
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
            msg.reply(msgs.errorMsg);
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

        // presenter joins a voice channel
        if (roles.isPresenter(memberTransformed)) {
            let replacements = {
                "%GUILD_NAME%": guild.name, "%BOT_NAME%": client.user.username,
                "%COMMAND_PREFIX%": commands.commandPrefix, "%STATUS_COMMAND%": commands.statusCommand,
                "%HELP_COMMAND%": commands.helpCommand, "%INFO_COMMAND%": commands.infoCommand,
                "%RAPORT_COMMAND%": commands.raportCommand, "%NAME%": name, "%CHANNEL%": newMember.channel.name
            }
            // for the first time
            if (!db.presenterExists(tag)) {
                db.addPresenter(name, tag);
                member.send(helpers.replaceMatches(msgs.presenterFirstMsg, replacements));
                guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (voiceStateUpdate): ` + helpers.replaceMatches(msgs.presenterFirstMsgLog, replacements) + "\n\n" + helpers.replaceMatches(msgs.presenterFirstMsg, replacements));
            }
            
            let mentionStr = ""
            guild.roles.cache.forEach(role => {
                if (config["rolesToMention"].includes(role.id)) {
                    mentionStr += "<@&" + role.id + "> ";
                }
            })

            guild.channels.cache.get(config["botMentionChannel"]).send(mentionStr + helpers.replaceMatches(msgs.presenterJoinMsg, replacements))
            .then((msg)=>{
                msg.delete({"timeout": 60000})
            });
            guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (voiceStateUpdate): ` + helpers.replaceMatches(msgs.presenterJoinMsg, replacements));
        }
        // not registered student (non admin nor presenter) tries to join a voice channel with strict mode enabled
        else if (roles.isStudent(memberTransformed) && !(roles.isAdmin(memberTransformed) || roles.isPresenter(memberTransformed)) && !db.studentExists(tag) && db.isStrictMode()) {
            let replacements = { "%NAME%": name, "%TAG%": tag }
            member.send(msgs.studentKickMsg, { "files": ["./user_kicked.png"] })
            newMember.kick(msgs.studentKickReasonMsg);
            member.roles.remove(member.roles.cache); // degrade user to lowest range
            guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (voiceStateUpdate): ` + helpers.replaceMatches(msgs.studentKickMsgLog, replacements) + "\n\n" + msgs.studentKickMsg, { "files": ["./user_kicked.png"] });
        }
        // not registered student (admin or presenter) tries to join a voice channel with strict mode enabled
        else if (roles.isStudent(memberTransformed) && (roles.isAdmin(memberTransformed) || roles.isPresenter(memberTransformed)) && !db.studentExists(tag) && db.isStrictMode()) {
            let replacements = { "%COMMAND_PREFIX%": commands.commandPrefix, "%ADD_STUDENT_COMMAND%": commands.addStudentCommand, "%NAME%": name }
            member.send(helpers.replaceMatches(msgs.adminWarnMsg, replacements), { "files": ["./user_kicked.png"] })
            guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (voiceStateUpdate): ` + helpers.replaceMatches(msgs.adminWarnMsgLog, replacements) + "\n\n" + helpers.replaceMatches(msgs.adminWarnMsg, replacements), { "files": ["./user_kicked.png"] });
        }
    }
})

client.on('guildMemberAdd', member => {
    const guild = member.guild
    const name = member.nickname ? member.nickname : member.user.username;
    const replacements = { "%NAME%": name, "%GUILD_NAME%": guild.name, "%BOT_NAME%": client.user.username };
    member.send(helpers.replaceMatches(msgs.welcomeMsg, replacements), { "files": ['./hello.gif'] });
    guild.channels.cache.get(config["botLogTextChannel"]).send(`LOG (guildMemberAdd): ` + helpers.replaceMatches(msgs.welcomeMsgLog, replacements) + "\n\n" + helpers.replaceMatches(msgs.welcomeMsg, replacements), { "files": ["./hello.gif"] });

});

client.login(config["token"]);