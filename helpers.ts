export module helpers {
    // transform dicord member into json required by roles.isX() functions
    export const transformMember = (member) => {
        var memberTransformed = {
            "roles": {
                "cache": member._roles.map((roleId) => {
                    return member.guild.roles.cache.get(roleId);
                })
            },
            "bot": member.user.bot
        }
        return memberTransformed;
    }

    export const JSONtoCSV = (data) => {
        var csv = data.map(function (d) {
            return JSON.stringify(Object.values(d));
        })
            .join('\n')
            .replace(/(^\[)|(\]$)|(\")/mg, '');
        return csv;
    }

    // splits args separated by spaces
    // spaces between quote marks are ignored
    export const splitArgs = (argStr) => {
        var aStr = argStr.match(/\w+|"[^"]+"/g), i = aStr.length;
        while (i--) {
            aStr[i] = aStr[i].replace(/"/g, "");
        }
        return aStr;
    }
}