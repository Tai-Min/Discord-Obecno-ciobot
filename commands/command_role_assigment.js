const Command = require('./command.js');
const config = require('../config/config.json')
const strings = require('../config/strings.js');
const Discord = require('discord.js');


class RoleAssigmentCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.assigmentCommand;
        this.reqRole = "admin";
        this.descriptionString = strings.assigmentDescription;
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        if(!this.canUseCommand(msg.member)){
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandPermissionFail);
            msg.delete();
            return;
        }

        // start voting
        let description = "";
        for (let i = 0; i < config["specs"].length; i++) {
            description += config["specs"][i].reaction + " " + config["specs"][i].name + "\n";
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(strings.votingEmbedTitle)
            .setColor(strings.embedColor)
            .setFooter(strings.embedFooter)
            .setDescription(description)
            .setThumbnail(strings.embedImage);

        bot.voteChannel.send(embed).then(votingMsg => {
            for (let i = 0; i < config["specs"].length; i++) {
                votingMsg.react(config["specs"][i].reaction);
            }
        });
        
        bot.sendLogs(name + strings.commandUsed + this.commandName);
        msg.delete();
    }
}

module.exports = RoleAssigmentCommand;