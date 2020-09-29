const config = require('./config/config.json');
const strings = require('./config/strings.js');
const helpers = require('./helpers.js');
const Discord = require('discord.js');
const HelpCommand = require('./commands/command_help.js');
const AboutCommand = require('./commands/command_about.js');
const RoleAssigmentCommand = require('./commands/command_role_assigment.js');
const PersenceCheckCommand = require('./commands/command_persence_check');

aboutCommand = new AboutCommand();
roleAssigmentCommand = new RoleAssigmentCommand();
persenceCheckCommand = new PersenceCheckCommand();
commands = [aboutCommand, roleAssigmentCommand, persenceCheckCommand]; // commands available to this bot

helpCommand = new HelpCommand(commands)
commands.unshift(helpCommand); // add help command

class Bot {
    constructor(discord, token, statusMsg, commandPrefix, commands, guildId, logChannelId, voteChannelId, mentionChannelId) {
        this.client = new discord.Client();

        // ready callback to set presence
        this.client.on('ready', () => {
            this.client.user.setPresence({
                status: 'online',
                activity: {
                    name: statusMsg,
                }
            });

            this.sendLogs("Bot running.");
        });

        // message callback to process commands from guild and dm's
        this.client.on('message', msg => {
            if(msg.author.bot)
                return;

            if(!msg.member)
                return;

            if (msg.content.startsWith(this.commandPrefix)) {
                const args = msg.content.slice(this.commandPrefix.length).trim().split(/ +/g);
                const command = args.shift().toLowerCase();
                this.processCommand(msg, command, args);
            }
        });

        this.client.on('guildMemberAdd', member => {
            this.greetNewUser(member);
        });

        this.client.on('messageReactionAdd', (reaction, user) =>{
            // ignore reactions when there is no voting active
            if(this.voteMsg === undefined)
                return;

            if(reaction.message.id === this.voteMsg.id && !user.bot){
                this.assignRole(reaction, user);
            }
        });

        this.client.login(token);

        // get guild and some channels
        this.client.guilds.fetch(guildId)
            .then(guild => {
                this.guild = guild;
                return this.logChannel = this.client.channels.fetch(logChannelId);
            }).then(logChannel => {
                this.logChannel = logChannel;
                return this.client.channels.fetch(voteChannelId);
            }).then(voteChannel => {
                this.voteChannel = voteChannel;
            });

        this.commandPrefix = commandPrefix;
        this.commands = commands;
        this.voteMsg = undefined;
    }

    sendLogs(msg) {
        this.logChannel.send(msg);
    }

    assignRole(reaction, user){
        const member = this.guild.members.cache.get(user.id);
        const name = member.nickname ? member.nickname : member.user.username;

        // find out what role to assign to user
        for (let i = 0; i < config["specs"].length; i++) {
            if(config["specs"][i].reaction === reaction._emoji.name){
                
                this.sendLogs(name + " changed it's role to " + config["specs"][i].name + ".");

                // remove unwanted roles
                for(let j = 0; j < config["specs"][i]["rolesToRemove"].length; j++){
                    const role = this.guild.roles.cache.get(config["specs"][i]["rolesToRemove"][j])
                    member.roles.remove(role);
                }
                // add requested roles
                for(let j = 0; j < config["specs"][i]["rolesToAssign"].length; j++){
                    const role = this.guild.roles.cache.get(config["specs"][i]["rolesToAssign"][j])
                    member.roles.add(role);
                }
                break;
            }
        }
    }

    greetNewUser(newUser) {
        const name = newUser.nickname ? newUser.nickname : newUser.user.username;
        const replacements = { "%NAME%": name, "%GUILD_NAME%": this.guild.name, "%BOT_NAME%": this.client.user.username };
        const embed = new Discord.MessageEmbed()
        .setColor(strings.helpEmbedColor)
        .setTitle(helpers.replaceMatches(strings.welcomeEmbedTitle, replacements))
        .setDescription(strings.welcomeEmbedDescription + "\n")
        .addField('\u200B', '\u200B')
        .addField(strings.welcomeEmbedForPresenters, strings.welcomeEmbedDescriptionForPresenters)
        .addField('\u200B', '\u200B')
        .addField(strings.welcomeEmbedForStudents, strings.welcomeEmbedDescriptionForStudents + "\n\n" + helpers.replaceMatches(strings.welcomeEmbedFinish, replacements))
        .setFooter(strings.welcomeEmbedFooter, strings.welcomeEmbedFooterImage);
        this.sendLogs(embed);
        newUser.send(embed);
    }

    processCommand(msg, command, args) {
        //this.greetNewUser(msg.member);
        for(let i = 0; i < this.commands.length; i++){
            if(this.commands[i].commandName === command){
                commands[i].exec(this, msg, args)
                break;
            } 
        }
    }
}

bot = new Bot(
    Discord, 
    config["botToken"], 
    config["statusMsg"],
    config["commandPrefix"], 
    commands, 
    config["guildId"], 
    config["logChannelId"], 
    config["voteChannelId"]);