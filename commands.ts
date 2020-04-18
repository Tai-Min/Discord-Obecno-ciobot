export module commands {
    const config = require('./config/config.json');

    export const commandPrefix = config["commandPrefix"];
    export const raportCommand = config["raportCommand"];
    export const statusCommand = config["statusCommand"];
    export const helpCommand = config["helpCommand"];
    export const infoCommand = config["infoCommand"];
    export const addStudentCommand = config["addStudentCommand"];
    export const removeStudentCommand = config["removeStudentCommand"];
    export const checkStudentCommand = config["checkStudentCommand"];
    export const strictModeCommand = config["strictModeCommand"];
    export const dumpCommand = config["dumpCommand"];
    export const insertAllCommand = config["insertAllCommand"];
    export const cleanUpListCommand = config["cleanUpListCommand"];
    export const insertListCommand = config["insertListCommand"];

    const presenterCommands = [config["helpCommand"], config["raportCommand"], config["infoCommand"], config["statusCommand"]];
    const adminCommands = [config["insertListCommand"], config["cleanUpListCommand"], config["insertAllCommand"], config["addStudentCommand"], config["removeStudentCommand"], config["checkStudentCommand"], config["strictModeCommand"], config["dumpCommand"]];
    const allCommands = presenterCommands.concat(adminCommands);
    const voiceChannelRequiredCommands = [config["raportCommand"], config["statusCommand"]];

    export const isCommand = (msg: String) => {
        if (allCommands.includes(msg.toString()))
            return true;
        return false;
    }

    export const isAdminCommand = (msg: String) => {
        if (adminCommands.includes(msg.toString()))
            return true;
        return false;
    }

    export const isPresenterCommand = (msg: String) => {
        if (presenterCommands.includes(msg.toString()))
            return true;
        return false;
    }

    export const hasPrefix = (msg: String) => {
        if (msg.length === 0) {
            return false;
        }
        if (msg[0] !== config["commandPrefix"]) {
            return false;
        }
        return true;
    }

    export const removePrefix = (command: String) => {
        return command.slice(1, command.length);
    }

    export const requiresVoiceChannel = (msg: String) => {
        if (voiceChannelRequiredCommands.includes(msg.toString()))
            return true;
        return false;
    }
}