export module msgs {
const config = require('./config/config.json');
const localeName = config["locale"];

const locale = require('./locales/' + localeName + '.js');

export const errorMsg = locale["errorMsg"];

export const welcomeMsgLog = locale["welcomeMsgLog"];
export const welcomeMsg = locale["welcomeMsg"];

export const adminHelp = locale["adminHelp"];
export const presenterHelp = locale["presenterHelp"];

export const statusMsgStrict = locale["statusMsgStrict"];
export const statusMsg = locale["statusMsg"];

export const raportErrorLog = locale["raportErrorLog"];
export const raportErrorLogShort = locale["raportErrorLogShort"];
export const raportFilePrefix = locale["raportFilePrefix"];
export const raportMsg = locale["raportMsg"];

export const infoMsg = locale["infoMsg"];

export const addAddedMsg = locale["addAddedMsg"];
export const addExistsMsg = locale["addExistsMsg"];

export const removeNotExistsMsg = locale["removeNotExistsMsg"];
export const removeRemovedMsg = locale["removeRemovedMsg"];

export const checkName = locale["checkName"];
export const checkExistTagMsg = locale["checkExistTagMsg"];
export const checkNotExistsTagMsg = locale["checkNotExistsTagMsg"];
export const checkExistsNameMsg = locale["checkExistsNameMsg"];
export const checkNotExistsNameMsg = locale["checkNotExistsNameMsg"];
export const checkExistsMultipleNameMsg = locale["checkExistsMultipleNameMsg"];
export const checkExistsMultipleNameShortMsg = locale["checkExistsMultipleNameShortMsg"];

export const dumpMsg = locale["dumpMsg"];
export const dumpFilename = locale["dumpFilename"];

export const insertAllMsg = locale["insertAllMsg"];
export const insertAllAddingMsg = locale["insertAllAddingMsg"];
export const insertAllExistsMsg = locale["insertAllExistsMsg"];
export const insertAllExistsTagMsg = locale["insertAllExistsTagMsg"];

export const cleanupMsg = locale["cleanupMsg"];

export const insertMsg = locale["insertMsg"];

export const strictStateOnMsg = locale["strictStateOnMsg"];
export const strictStateOffMsg = locale["strictStateOffMsg"];
export const strictEnabledMsg = locale["strictEnabledMsg"];
export const strictDisabledMsg = locale["strictDisabledMsg"];

export const warnVoice = locale["warnVoice"];
export const warnParam = locale["warnParam"];
export const warnAttach = locale["warnAttach"];

export const presenterFirstMsgLog = locale["presenterFirstMsgLog"];
export const studentKickMsgLog = locale["studentKickMsgLog"];
export const adminWarnMsgLog = locale["adminWarnMsgLog"];

export const presenterFirstMsg = locale["presenterFirstMsg"];
export const studentKickMsg = locale["studentKickMsg"];
export const adminWarnMsg = locale["adminWarnMsg"];
export const studentKickReasonMsg = locale["studentKickReasonMsg"];
export const presenterJoinMsg = locale["presenterJoinMsg"];
}