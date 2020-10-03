const Command = require('./command.js');
const strings = require('../config/strings.js');
const Discord = require('discord.js');

class AboutCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.aboutCommand;
        this.reqRole = "all";
        this.descriptionString = strings.aboutDescription;
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        const embed = new Discord.MessageEmbed()
        .setDescription(strings.aboutEmbedMsg)
        .setFooter(strings.embedFooter, strings.embedFooterImage)
        .setThumbnail(strings.embedImage);
        bot.sendLogs(name + strings.commandUsed + this.commandName);
        this.replyThenDelete(msg, embed, 60000);
    }
}

module.exports = AboutCommand;