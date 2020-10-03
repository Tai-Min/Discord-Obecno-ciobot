const config = require('./config/config.json');

const replaceMatches = (str, replacements) => {
    return str.replace(/%\w+%/g, function (all) {
        return replacements[all] || all;
    });
}

const isAdmin = (member) => {
    if (member.bot === true)
        return false;

    const adminRoles = config["adminRoles"];
    for (var i = 0; i < adminRoles.length; i++) {
        if (member.roles.cache.some(role => role.id === adminRoles[i])) {
            return true;
        }
    }
    return false;
}

const isPresenter = (member) => {
    if (member.bot === true)
        return false;

    const presenterRoles = config["presenterRoles"];
    for (var i = 0; i < presenterRoles.length; i++) {
        if (member.roles.cache.some(role => role.id === presenterRoles[i])) {
            return true;
        }
    }
    return false;
}

const isStudent = (member) => {
    if (member.bot === true)
        return false;

    const studentRoles = config["studentRoles"];
    for (var i = 0; i < studentRoles.length; i++) {
        if (member.roles.cache.some(role => role.id === studentRoles[i])) {
            return true;
        }
    }
    return false;
}

const getSpec = (member)=>{
    if (member.bot === true)
        return "";
    
    const specs = config["specs"];
    for(let i = 0; i < specs.length; i++){
        for(let j = 0; j < specs[i].rolesToAssign.length; j++){
            if(!member.roles.cache.get(specs[i].rolesToAssign[j]))
                break;

            // user has all roles for this spec so assume that this is his spec.
            if(j === specs[i].rolesToAssign.length-1)
                return specs[i].name;
        }
    }
    return "";
}

exports.replaceMatches = replaceMatches;
exports.isAdmin = isAdmin;
exports.isPresenter = isPresenter;
exports.isStudent = isStudent;
exports.getSpec = getSpec;