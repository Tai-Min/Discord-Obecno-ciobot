const Command = require('./command.js');
const config = require("../config/config.json");
const strings = require('../config/strings.js');
const fetch = require('node-fetch');
const { table } = require('table');
const fs = require('fs');
const jsonfile = require('jsonfile');
const lodash = require('lodash')

class AutoTableCommand extends Command {
    constructor(client) {
        super();
        this.client = undefined;
        this.commandName = strings.autoTableCommand;
        this.reqRole = "presenter";
        this.descriptionString = strings.autoTableDescription;
    }

    setClientStartUpdater(client){
        this.client = client;
        setInterval(()=>{
            this.updateTables();
        }, 600000); // 10 minutes
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

    editMessages(tabData, resultsArr) {
        for (let msgId = 0; msgId < tabData.msgIds.length; msgId++) {
            this.client.channels.fetch(tabData.channelId)
                .then(channel => {
                    return channel.messages.fetch(tabData.msgIds[msgId])
                })
                .then((msg) => {
                    if (msgId < resultsArr.length && msg.content !== resultsArr[msgId]){
                        msg.edit(resultsArr[msgId]);
                    }
                    else if(msg.content !== strings.autotableReserved){
                        msg.edit(strings.autotableReserved);
                    }
                })
                .catch(()=>{
                    jsonfile.readFile('./autotables/autotables.json')
                    .then((obj)=>{
                        for(let i = 0; i < obj.root.length; i++){
                            if(lodash.isEqual(obj.root[i], tabData)){
                                obj.root.splice(i, 1);
                                jsonfile.writeFileSync('./autotables/autotables.json', obj);
                            }
                        }
                    });
                })
        }
    }

    updateSingleTable(tabData) {
        // get spreadsheet
        fetch(tabData.url, { method: "Get" })
            .then(res => res.json())
            .then((json) => {
                // process spreadsheet into messages
                this.equalizeArrays(json.values);
                const result = table(json.values);
                const resultsArr = this.splitTable(result);
                // edit messages
                this.editMessages(tabData, resultsArr);
            })
    }

    updateTables() {
        if (!fs.existsSync('./autotables/autotables.json'))
            return;

        jsonfile.readFile('./autotables/autotables.json')
            .then((obj) => {
                // update each table
                for (let tab = 0; tab < obj.root.length; tab++) {
                    this.updateSingleTable(obj.root[tab]);
                }
            });
    }

    exec(bot, msg, args) {
        const name = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        if (!this.canUseCommand(msg.member)) {
            bot.sendLogs(name + " tried to use " + this.commandName + " but don't have permissions.");
            msg.delete();
            return false;
        }

        if (args.length < 3) {
            bot.sendLogs(name + " tried to use " + this.commandName + " but provided not enough arguments.");
            this.replyThenDelete(msg, strings.tableNotEnoughArguments, 10000);
        }

        const spreadsheetId = args[0];
        const cellRange = args[1];
        const numMessages = args[2];
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + cellRange + '?key=' + config['spreadsheetsApiKey'];

        let promises = [];
        for (let i = 0; i < numMessages; i++) {
            promises.push(msg.channel.send(strings.autotableReserved));
        }
        Promise.all(promises)
            .then((messages) => {
                const data = {
                    url: url,
                    channelId: msg.channel.id,
                    msgIds: messages.map(message => message.id),
                }
                if (!fs.existsSync('./autotables/autotables.json')) {
                    fs.mkdirSync("./autotables");
                    fs.writeFileSync('./autotables/autotables.json', "{\"root\" : []}");
                }
                jsonfile.readFile('./autotables/autotables.json')
                    .then((obj) => {
                        obj.root.push(data);
                        jsonfile.writeFileSync('./autotables/autotables.json', obj);
                        this.updateTables();
                        bot.sendLogs(name + " generated autotable in channel " + msg.channel.name);
                    })
                    .catch((err) => {
                        this.replyThenDelete(strings.tableGetFail);
                    })
            })
    }
}

module.exports = AutoTableCommand;