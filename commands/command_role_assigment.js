const Command = require('./command.js');
const config = require('../config/config.json')
const strings = require('../config/strings.js');
const Discord = require('discord.js');


class RoleAssigmentCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.assigmentCommand;
        this.reqRole = "admin";
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        if(!this.canUseCommand(msg.member)){
            bot.sendLogs(name + " tried to use " + this.commandName + " but don't have permissions.");
            msg.delete();
            return false;
        }

        // stop voting
        if(bot.voteMsg !== undefined){
            bot.sendLogs(name + " disabled spec voting.");
            bot.voteMsg.delete()
            .then(()=>{
                bot.voteMsg = undefined;
                msg.delete();
            })
            .catch(()=>{
                bot.voteMsg = undefined;
                this.exec(bot, msg, args)
            });
            return true;
        }

        // start voting
        let description = "";
        for (let i = 0; i < config["specs"].length; i++) {
            description += config["specs"][i].reaction + " " + config["specs"][i].name + "\n";
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(strings.votingEmbedTitle)
            .setColor(strings.votingEmbedColor)
            .setDescription(description);

        bot.voteChannel.send(embed).then(votingMsg => {
            for (let i = 0; i < config["specs"].length; i++) {
                votingMsg.react(config["specs"][i].reaction);
            }
            bot.voteMsg = votingMsg;
        });
        
        bot.sendLogs(name + " enabled spec voting.");
        msg.delete();

        return true;
    }

    description() {
        return strings.assigmentDescription;
    }
}

module.exports = RoleAssigmentCommand;