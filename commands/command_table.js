const Command = require('./command.js');
const config = require("../config/config.json");
const strings = require('../config/strings.js');
const fetch = require('node-fetch');
const { table } = require('table');

class HelpCommand extends Command {
    constructor(otherCommands) {
        super();
        this.commandName = strings.tableCommand;
        this.otherCommands = otherCommands;
        this.reqRole = "presenter";
        this.descriptionString = strings.tableDescription;
    }

    equalizeArrays(arr){
        let maxLen = 0;
        for(let i = 0; i < arr.length; i++){
            if(arr[i].length > maxLen)
                maxLen = arr[i].length;
        }

        for(let i = 0; i < arr.length; i++){
            arr[i].push(...Array(maxLen-arr[i].length).fill(" "));
        }
    }

    exec(bot, msg, args) {
        if(!this.canUseCommand(msg.member)){
            bot.sendLogs(name + " tried to use " + this.commandName + " but don't have permissions.");
            msg.delete();
            return false;
        }

        const spreadsheetId = args[0];
        const cellRange = args[1];
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + cellRange + '?key=' + config['spreadsheetsApiKey'];
        const settings = {method : "Get"};
        fetch(url,settings)
        .then(res => res.json())
        .then((json)=>{
            this.equalizeArrays(json.values);
            const result = "\`\`\`\n" + table(json.values) + "\n\`\`\`";
            this.reply(msg, result);
            
        }).catch(()=>{
            this.replyThenDelete(msg, strings.tableGetFail, 10000);
            return false;
        });
    }
}

module.exports = HelpCommand;