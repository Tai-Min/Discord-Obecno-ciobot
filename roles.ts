export module roles {
    const config = require('./config/config.json');

    const presenterRoles = config["presenterRoles"];
    const adminRoles = config["adminRoles"];
    const studentRoles = config["studentRoles"];

    export const isAdmin = (member) => {
        if (member.bot === true)
            return false;

        for (var i = 0; i < adminRoles.length; i++) {
            if (member.roles.cache.some(role => role.id === adminRoles[i])) {
                return true;
            }
        }
        return false;
    }

    export const isPresenter = (member) => {
        if (member.bot === true)
            return false;

        for (var i = 0; i < presenterRoles.length; i++) {
            if (member.roles.cache.some(role => role.id === presenterRoles[i])) {
                return true;
            }
        }
        return false;
    }

    export const isStudent = (member) => {
        if (member.bot === true)
            return false;

        for (var i = 0; i < studentRoles.length; i++) {
            if (member.roles.cache.some(role => role.id === studentRoles[i])) {
                return true;
            }
        }
        return false;
    }
}