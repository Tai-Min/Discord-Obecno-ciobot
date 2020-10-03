const config = require('./config/config.json');
const strings = require('./config/strings.js');
const helpers = require('./helpers.js');
const Discord = require('discord.js');
const HelpCommand = require('./commands/command_help.js');
const AboutCommand = require('./commands/command_about.js');
const RoleAssigmentCommand = require('./commands/command_role_assigment.js');
const PersenceCheckCommand = require('./commands/command_persence_check.js');
const TableCommand = require('./commands/command_table.js');
const AutoTableCommand = require('./commands/command_autotable.js');

aboutCommand = new AboutCommand();
roleAssigmentCommand = new RoleAssigmentCommand();
persenceCheckCommand = new PersenceCheckCommand();
tableCommand = new TableCommand();
autoTableCommand = new AutoTableCommand();
commands = [aboutCommand, roleAssigmentCommand, persenceCheckCommand, tableCommand, autoTableCommand]; // commands available to this bot

helpCommand = new HelpCommand(commands)
commands.unshift(helpCommand); // add help command

class Bot {
    constructor() {
        this.client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

        // ready callback to set presence
        this.client.on('ready', () => {
            this.client.user.setPresence({
                status: 'online',
                activity: {
                    name: config["statusMsg"],
                }
            });
        });

        // message callback to process commands from guild
        this.client.on('message', msg => {
            // ignore bots
            if (msg.author.bot)
                return;

            // ignore dm's
            if (!msg.member)
                return;

            // react only to prefix
            if (msg.content.startsWith(this.commandPrefix)) {
                const args = msg.content.slice(this.commandPrefix.length).trim().split(/ +/g);
                const command = args.shift().toLowerCase();
                this.processCommand(msg, command, args);
            }
        });

        this.client.on('guildMemberAdd', member => {
            this.greetNewUser(member);
        });

        this.client.on('messageReactionAdd', (reaction, user) => {
            if (user.bot)
                return;

            if (reaction.partial) {
                // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
                try {
                    reaction.fetch().then(() => {
                        if (reaction.message.author.id === this.client.user.id && reaction.message.embeds.length === 1) {
                            if (reaction.message.embeds[0].title === strings.votingEmbedTitle)
                                this.assignRole(reaction, user);
                        }
                    });
                } catch (error) {
                    return;
                }
            }
            else {
                if (reaction.message.author.id === this.client.user.id && reaction.message.embeds.length === 1) {
                    if (reaction.message.embeds[0].title === strings.votingEmbedTitle)
                        this.assignRole(reaction, user);
                }
            }
        });

        this.client.login(config["botToken"]);

        // get guild and some channels
        this.client.guilds.fetch(config["guildId"])
            .then(guild => {
                this.guild = guild;
                autoTableCommand.setClientStartUpdater(this.client);

                return this.logChannel = this.client.channels.fetch(config["logChannelId"]);
            }).then(logChannel => {
                this.logChannel = logChannel;
                return this.client.channels.fetch(config["voteChannelId"]);
            }).then(voteChannel => {
                this.voteChannel = voteChannel;
            });

        this.commandPrefix = config["commandPrefix"];
        this.commands = commands;
    }

    sendLogs(msg) {
        this.logChannel.send(msg);
    }

    assignRole(reaction, user) {
        const member = this.guild.members.cache.get(user.id);
        const name = member.nickname ? member.nickname : member.user.username;

        if (helpers.isPresenter(member)) {
            this.sendLogs(name + strings.votingPresenterTriedRoleChange);
            return;
        }

        // find out what role to assign to user
        for (let i = 0; i < config["specs"].length; i++) {
            if (config["specs"][i].reaction === reaction._emoji.name) {

                this.sendLogs(name + strings.votingRoleChanges + config["specs"][i].name + ".");

                // remove unwanted roles
                for (let j = 0; j < config["specs"][i]["rolesToRemove"].length; j++) {
                    const role = this.guild.roles.cache.get(config["specs"][i]["rolesToRemove"][j])
                    member.roles.remove(role);
                }
                // add requested roles
                for (let j = 0; j < config["specs"][i]["rolesToAssign"].length; j++) {
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
            .setColor(strings.embedColor)
            .setTitle(helpers.replaceMatches(strings.welcomeEmbedTitle, replacements))
            .setDescription(strings.welcomeEmbedDescription + "\n")
            .addField('\u200B', '\u200B')
            .addField(strings.welcomeEmbedForPresenters, strings.welcomeEmbedDescriptionForPresenters)
            .addField('\u200B', '\u200B')
            .addField(strings.welcomeEmbedForStudents, strings.welcomeEmbedDescriptionForStudents + "\n\n" + helpers.replaceMatches(strings.welcomeEmbedFinish, replacements))
            .setFooter(strings.embedFooter, strings.embedFooterImage)
            .setThumbnail(strings.embedImage);
        this.sendLogs(embed);
        newUser.send(embed);
    }

    processCommand(msg, command, args) {
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i].commandName === command) {
                commands[i].exec(this, msg, args)
                break;
            }
        }
    }
}

bot = new Bot();