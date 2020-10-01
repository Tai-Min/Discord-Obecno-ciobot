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

    splitTable(tab){
        const lines = tab.split("\n");

        let cntr = 0;
        let resArr = [];
        while(cntr < lines.length){
            let res = "```";
            while(res.length + lines[cntr].length + 1 + 3 < 2000 && cntr < lines.length){
                res += lines[cntr] + "\n";
                cntr++;
                if(cntr >= lines.length)
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
            bot.sendLogs(name + " tried to use " + this.commandName + " but don't have permissions.");
            msg.delete();
            return false;
        }

        if(args.length < 2){
            bot.sendLogs(name + " tried to use " + this.commandName + " but provided not enough arguments.");
            this.replyThenDelete(msg, strings.tableNotEnoughArguments, 10000);
        }

        const spreadsheetId = args[0];
        const cellRange = args[1];
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + cellRange + '?key=' + config['spreadsheetsApiKey'];
        const settings = { method: "Get" };
        fetch(url, settings)
            .then(res => res.json())
            .then((json) => {
                this.equalizeArrays(json.values);

                const result = table(json.values);
                const resultsArr = this.splitTable(result);

                let promises = [];
                for(let i = 0; i < resultsArr.length; i++){
                    promises.push(msg.channel.send(resultsArr[i]));
                }
                Promise.all(promises)
                .then(()=>{
                    bot.sendLogs(name + " generated table in channel " + msg.channel.name);
                    msg.delete();
                })
            }).catch(() => {
                this.replyThenDelete(msg, strings.tableGetFail, 10000);
                return false;
            });
    }
}

module.exports = TableCommand;