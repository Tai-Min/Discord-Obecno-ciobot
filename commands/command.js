const helpers = require('../helpers.js');

class Command {
    constructor(){
        this.commandName = "command"
        this.reqRole = "admin";
    }
    
    replyThenDelete(msg, content, timeout, attachment){
        if(attachment){
            msg.reply(content, attachment).then(reply=>{
                msg.delete();
                reply.delete({timeout: timeout});
            });
        }
        else{
            msg.reply(content).then(reply=>{
                msg.delete();
                reply.delete({timeout: timeout});
            });
        }
    }

    reply(msg, content, attachment){
        if(attachment){
            msg.reply(content, attachment).then(()=>{
                msg.delete();
            })
        }
        else{
            msg.reply(content).then(()=>{
                msg.delete();
            })
        }
    }

    canUseCommand(member){
        if(this.reqRole == "all")
            return true;
        if(this.reqRole == "admin" && helpers.isAdmin(member))
            return true;
        if(this.reqRole == "presenter" && (helpers.isPresenter(member) || helpers.isAdmin(member)))
            return true;
        return false;
    }

    exec(bot, msg, args){
        return true;
    }

    description(){
        return "Something went wrong :/";
    }
}

module.exports = Command;