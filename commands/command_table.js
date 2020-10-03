const Command = require('./command.js');
const config = require("../config/config.json");
const strings = require('../config/strings.js');
const fetch = require('node-fetch');
const { table } = require('table');

class TableCommand extends Command {
    constructor() {
        super();
        this.commandName = strings.tableCommand;
        this.reqRole = "presenter";
        this.descriptionString = strings.tableDescription;
    }

    equalizeArrays(arr) {
        let maxLen = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length > maxLen)
                maxLen = arr[i].length;
        }

        for (let i = 0; i < arr.length; i++) {
            arr[i].push(...Array(maxLen - arr[i].length).fill(" "));
        }
    }

    splitTable(tab) {
        const lines = tab.split("\n");

        let cntr = 0;
        let resArr = [];
        while (cntr < lines.length) {
            let res = "```";
            while (res.length + lines[cntr].length + 1 + 3 < 2000 && cntr < lines.length) {
                res += lines[cntr] + "\n";
                cntr++;
                if (cntr >= lines.length)
                    break;
            }
            res += "```";

            resArr.push(res);
        }

        return resArr;
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        if (!this.canUseCommand(msg.member)) {
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandPermissionFail);
            msg.delete();
            return;
        }

        if (args.length < 2) {
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandArgsFail);
            this.replyThenDelete(msg, strings.tableNotEnoughArguments, 10000);
            return;
        }

        const spreadsheetId = args[0];
        const cellRange = args[1];
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + cellRange + '?key=' + config['spreadsheetsApiKey'];
        const settings = { method: "Get" };
        fetch(url, settings)
            .then(res => res.json())
            .then((json) => {
                this.equalizeArrays(json.values);

                let config = {
                    columns: {}
                }
                for (let i = 1; i < json.values[0].length; i++) {
                    config.columns[i] = { width: 11, truncate: 33, wrapWord: true };
                }

                const result = table(json.values, config);
                const resultsArr = this.splitTable(result);

                let promises = [];
                for (let i = 0; i < resultsArr.length; i++) {
                    promises.push(msg.channel.send(resultsArr[i]));
                }
                return Promise.all(promises)
            })
            .then(() => {
                bot.sendLogs(name + strings.tableGenerated + msg.channel.name);
                msg.delete();
            })
            .catch(() => {
                this.replyThenDelete(msg, strings.tableGetFail, 10000);
            });
        bot.sendLogs(name + strings.commandUsed + this.commandName);
    }
}

module.exports = TableCommand;
