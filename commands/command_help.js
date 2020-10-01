const Command = require('./command.js');
const config = require("../config/config.json");
const strings = require('../config/strings.js');
const Discord = require('discord.js');
const helpers = require('../helpers.js');

class HelpCommand extends Command {
    constructor(otherCommands) {
        super();
        this.commandName = strings.helpCommand;
        this.otherCommands = otherCommands;
        this.reqRole = "all";
        this.descriptionString = strings.helpDescription;
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        const embed = new Discord.MessageEmbed()
        .setColor(strings.helpEmbedColor)
        .setTitle(strings.helpEmbedTitle)
        .setDescription(strings.helpEmbedDescription)
        .setFooter(strings.helpEmbedFooter, strings.helpEmbedFooterImage)
        .setThumbnail(strings.helpEmbedImage)
        for(let i = 0; i < this.otherCommands.length; i++){
            // only admin can use those commands
            if(helpers.isAdmin(msg.member) && this.otherCommands[i].reqRole === "admin")
                embed.addField(config.commandPrefix + this.otherCommands[i].commandName, this.otherCommands[i].description(), false);
            // only admin and presenter can use those commands
            else if((helpers.isPresenter(msg.member) || helpers.isAdmin(msg.member))&& this.otherCommands[i].reqRole === "presenter")
                embed.addField(config.commandPrefix + this.otherCommands[i].commandName, this.otherCommands[i].description(), false);
            // everyone can use those commands
            else if(this.otherCommands[i].reqRole === "all")
                embed.addField(config.commandPrefix + this.otherCommands[i].commandName, this.otherCommands[i].description(), false);
        }
        bot.sendLogs(name + " used help command.");
        this.replyThenDelete(msg, embed, 60000);
        return true;
    }
}

module.exports = HelpCommand;