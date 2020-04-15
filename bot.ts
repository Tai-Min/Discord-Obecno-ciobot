const Discord = require('discord.js');
const moment = require('moment');
const config = require('./config.json');

moment.locale('pl'); 

const client = new Discord.Client();

const commandPrefix = config["commandPrefix"];
const generateReportCommand = config["reportCommand"];
const statusCommand = config["statusCommand"];
const helpCommand = config["helpCommand"];
const infoCommand = config["infoCommand"];
const commands = [generateReportCommand, statusCommand, helpCommand, infoCommand];

const allowedRoles = config["allowedRoles"];
const studentRoles = config["studentRoles"];
const presenterRoles = config["presenterRoles"];

const isAllowed = (member) => {
    for(var i = 0; i < allowedRoles.length; i++){
        if(member.roles.cache.some(role => role.name === allowedRoles[i])){
            return true;
        }     
    }
    return false;
}

const isStudent = (member)=> {
    if(member.bot === true)
        return false;

    for(var i = 0; i < studentRoles.length; i++){
        if(member.roles.cache.some(role => role.name === presenterRoles[i])){
            return false;
        }     
    }

    for(var i = 0; i < studentRoles.length; i++){
        if(member.roles.cache.some(role => role.name === studentRoles[i])){
            return true;
        }     
    }
    return false;
}

const isCommand = (msg: String) => {
    if(commands.includes(msg.toString()))
        return true;
    return false;
}

const isValidCommand = (msg: String) => {
    if(msg.length === 0){
        return false;
    }
    if(msg[0] !== commandPrefix){
        return false;
    }
    if(!isCommand(msg.slice(1, msg.length).trim())){
        return false;
    }
    return true;
}

const transformMember = (member, guild) => {
    var memberTransformed = {
        "roles":{
            "cache": member._roles.map((roleId)=>{
                return guild.roles.cache.get(roleId);
            })
        },
        "bot":member.user.bot
    }
    return memberTransformed;
}

const getStatusMsg = (guild, channel)=> {
    var presentStudents = channel.members.filter(member => isStudent(member));

    var totalStudents = guild.members.cache.filter((member)=>{
        var memberTransformed = transformMember(member, guild);
        return isStudent(memberTransformed);
    });

    var str = `
    ${moment().format('LLL')}
    Obecność: ${presentStudents.size}/${totalStudents.size} całkowitej ilości studentów na serwerze.
    `;
    return str;
}

const JSONtoCSV = (data) => {
    var csv = data.map(function(d){
        return JSON.stringify(Object.values(d));
    })
    .join('\n') 
    .replace(/(^\[)|(\]$)|(\")/mg, '');
    return csv;
}

const getReportMessage = (guild, channel) => {
    var presence = [];
    var cnt = 1;

    channel.members.forEach(member => {
        var memberTransformed = transformMember(member, guild);
        if(isStudent(memberTransformed))
        {
            if(member.nickname === null || member.nickname === undefined)
                presence.push({"id":cnt, "osoba":member.user.username});
            else
                presence.push({"id":cnt, "osoba":member.nickname});
                cnt++;
        }
    });
    var csv = JSONtoCSV(presence);

    var bufSize = csv.length;
    var buf = Buffer.alloc(bufSize);
    var filename = "Wyklad_" + moment().format('YYYY_MM_DD_HH_mm_ss') + ".csv";

    buf.write(csv);
    return ["\nW załączniku znajduje się lista obecności:", {"files" : [{
        attachment: buf,
        name: filename
      }]}];
    }

const getHelpMsg = () => {
    return `
    ${commandPrefix}${helpCommand} - Wyświetla tą wiadomość.
    ${commandPrefix}${statusCommand} - Wyświetla aktualną obecność na wykładzie, wymaga obecności na kanale głosowym.
    ${commandPrefix}${generateReportCommand} - Generuje plik csv z obecnością, wymaga obecności na kanale głosowym.
    ${commandPrefix}info - Wyświetla informacje o tym bocie.

    Ta wiadomość zniknie za 20 sekund...
    `;
}

const getInfoMsg = () => {
    return `
Bot stworzony w celu sprawdzenia obecności na zajęciach online na pierwszym semestrze studiow magisterskich na Wydziale Elektrotechniki i Automatyki na Politechnice Gdańskiej
https://github.com/Tai-Min

The MIT License

Copyright 2020 Mateusz Pająk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    `;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if(isValidCommand(msg.content)){

      if(!isAllowed(msg.member)){
        msg.delete();
          return;
      }
      var content = msg.content.slice(1, msg.content.length);

      var channelID = msg.member.voice.channelID;
      if((channelID === null || channelID === undefined) && content != helpCommand && content !=infoCommand){
          msg.reply("Użycie tej komendy wymaga obecności na kanale głosowym").then((reply)=>{
              msg.delete();
              reply.delete({"timeout":5000});
          });
          return;
      }

      var channel = client.channels.cache.get(channelID);
      var guild = client.guilds.cache.get(msg.member.guild.id);

      
      switch(content){
          case generateReportCommand:
              var report = getReportMessage(guild, channel);
              msg.reply(report[0], report[1]).then((reply)=>{
                  msg.delete();
              });
              break;
          case statusCommand:
              msg.reply(getStatusMsg(guild, channel)).then((reply)=>{
                  msg.delete();
              });
              break;
          case helpCommand:
              //reply with help message and delete sender's message
              //then delete help message after some time
              msg.reply(getHelpMsg()).then((reply)=>{
                msg.delete();
                reply.delete({"timeout":20000});
              });
              break;
        case infoCommand:
            msg.reply(getInfoMsg()).then((reply)=>{
                msg.delete();
                reply.delete({"timeout":35000});
            });
            break;
          default:
              msg.reply("Undefined error");
              break;
      }
  }
});

client.login(config["token"]);