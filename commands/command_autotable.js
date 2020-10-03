const TableCommand = require('./command_table.js');
const config = require("../config/config.json");
const strings = require('../config/strings.js');
const fetch = require('node-fetch');
const { table } = require('table');
const fs = require('fs');
const jsonfile = require('jsonfile');
const lodash = require('lodash')

class AutoTableCommand extends TableCommand {
    constructor() {
        super();
        this.commandName = strings.autoTableCommand;
        this.reqRole = "presenter";
        this.descriptionString = strings.autoTableDescription;
    }

    setClientStartUpdater(client) {
        this.client = client;
        setInterval(() => {
            this.updateTables();
        }, 600000); // 10 minutes
    }

    editMessages(tabData, resultsArr) {
        for (let msgId = 0; msgId < tabData.msgIds.length; msgId++) {
            this.client.channels.fetch(tabData.channelId)
                .then(channel => {
                    return channel.messages.fetch(tabData.msgIds[msgId])
                })
                .then((msg) => {
                    if (msgId < resultsArr.length) {
                        if (msg.content !== resultsArr[msgId])
                            msg.edit(resultsArr[msgId]);
                    }
                    else {
                        if (msg.content !== strings.autotableReserved)
                            msg.edit(strings.autotableReserved);
                    }
                })
                .catch(() => {
                    // remove autotable
                    jsonfile.readFile('./autotables/autotables.json')
                        .then((obj) => {
                            for (let i = 0; i < obj.root.length; i++) {
                                if (lodash.isEqual(obj.root[i], tabData)) {
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

                let config = {
                    columns: {}
                }
                for (let i = 1; i < json.values[0].length; i++) {
                    config.columns[i] = { width: 11, truncate: 33, wrapWord: true };
                }

                const result = table(json.values, config);
                const resultsArr = this.splitTable(result);

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
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandPermissionFail);
            msg.delete();
            return;
        }

        if (args.length !== 3 && args.length !== 0) {
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandArgsCountFail);
            this.replyThenDelete(msg, strings.tableNotEnoughArguments, 10000);
            return;
        }

        const spreadsheetId = args[0];
        const cellRange = args[1];
        const numMessages = args[2];
        if(numMessages <= 0){
            this.replyThenDelete(msg, strings.autotableMsgCountFail, 10000);
            bot.sendLogs(name + strings.commandTriedToUse + this.commandName + strings.commandArgsFail);
            return;
        }

        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + cellRange + '?key=' + config['spreadsheetsApiKey'];

        if (args.length === 0) {
            this.updateTables();
            this.replyThenDelete(msg, strings.autotableUpdated, 10000);
            bot.sendLogs(name + strings.commandUsed + this.commandName);
            return;
        }

        // check if url can be fetched
        let messages;
        fetch(url, { method: "Get" })
            .then(data => data.json())
            .then((data) => { // if yes then add endpoint to list of autotables
                if (!data.values) {
                    throw "";
                }

                let promises = [];
                for (let i = 0; i < numMessages; i++) {
                    promises.push(msg.channel.send(strings.autotableReserved));
                }
                return Promise.all(promises)
            })
            .then((msgs) => {
                messages = msgs
                if (!fs.existsSync('./autotables/autotables.json')) {
                    fs.mkdirSync("./autotables");
                    fs.writeFileSync('./autotables/autotables.json', "{\"root\" : []}");
                }
                return jsonfile.readFile('./autotables/autotables.json')
            })
            .then((obj) => {
                const data = {
                    url: url,
                    channelId: msg.channel.id,
                    msgIds: messages.map(message => message.id),
                }
                obj.root.push(data);
                jsonfile.writeFileSync('./autotables/autotables.json', obj);
                this.updateTables();
                bot.sendLogs(name + strings.autotableGenerated + msg.channel.name);
                msg.delete();
            })
            .catch(() => {
                this.replyThenDelete(msg, strings.autotableGetFail, 10000);
            })
        bot.sendLogs(name + strings.commandUsed + this.commandName);
    }
}

module.exports = AutoTableCommand;