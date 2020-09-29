const Command = require('./command.js');
const strings = require('../config/strings.js');
const Discord = require('discord.js');

class AboutCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.aboutCommand;
        this.reqRole = "all";
    }

    exec(bot, msg, args) {
        const embed = new Discord.MessageEmbed()
        .setDescription(strings.aboutEmbedMsg)
        .setFooter(strings.aboutEmbedFooter, strings.aboutEmbedFooterImage);
        this.replyThenDelete(msg, embed, 60000);
        return true;
    }

    description(){
        return strings.aboutDescription;
    }
}

module.exports = AboutCommand;