const Command = require('./command.js');
const config = require('../config/config.json')
const strings = require('../config/strings.js');
const Discord = require('discord.js');
const helpers = require('../helpers.js');

class PersenceCheckCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.persenceCommand;
        this.reqRole = "presenter";
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        if(!this.canUseCommand(msg.member)){
            bot.sendLogs(name + " tried to use " + this.commandName + " but don't have permissions.");
            msg.delete();
            return false;
        }
            
        const vChannelID = msg.member.voice.channelID;
        if(!vChannelID){
            bot.sendLogs(name + " tried to use persence command but is not in voice channel.");
            this.replyThenDelete(msg, strings.persenceFailedMsg, 10000);
            return false;
        }

        const vChannel = bot.client.channels.cache.get(vChannelID);
        let list = strings.persenceCsvFirstRow;
        let cntr = 1;
        vChannel.members.forEach(member => {
            if(helpers.isStudent(member)){
                const name = member.nickname ? member.nickname : member.user.username;
                list += cntr.toString() + "," + name + "," + helpers.getSpec(member) + "\n";
                cntr++;
            }
        });

        const filename = strings.persenceFilename;
        const bufSize = Buffer.byteLength(list, 'utf-8');
        const buf = Buffer.alloc(bufSize, 'utf-8');
        buf.write(list);

        bot.sendLogs(name + " checked persence in voice channel " + vChannel.name + ".");
        this.reply(msg, strings.persenceSuccessMsg, {"files":[{attachment: buf, name: filename}]});

        return true;
    }

    description() {
        return strings.persenceDescription;
    }
}

module.exports = PersenceCheckCommand;