export module db {
    var accents = require('remove-accents');

    const low = require('lowdb');
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('./db/db.json')
    const db = low(adapter);

    db.defaults({ students: [], presenters: [], strict_mode: false }).write();

    export const simplifyName = (name) => {
        return accents.remove(name).toLowerCase()
    }

    export const presenterExists = (tag) => {
        if (!db.get("presenters").find({ tag: tag }).value())
            return false;
        return true;
    }

    export const addPresenter = (name, tag) => {
        if (presenterExists(tag))
            return false;
        db.get("presenters").push({ name: name, tag: tag }).write();
        return true;
    }

    export const removePresenter = (tag) => {
        if (!presenterExists(tag))
            return false;
        db.get("presenters").remove({ tag: tag }).write();
        return true;
    }

    export const getPresenter = (tag) => {
        return db.get("presenters").find({ tag: tag }).value();
    }

    export const studentExists = (tag) => {
        if (!db.get("students").find({ tag: tag }).value())
            return false;
        return true;
    }

    export const addStudent = (name, tag) => {
        if (studentExists(tag))
            return false;
        db.get("students").push({ name: name, tag: tag }).write();
        return true;
    }

    export const removeStudent = (tag) => {
        if (!studentExists(tag))
            return false;
        db.get("students").remove({ tag: tag }).write();
        return true;
    }

    export const getStudent = (tag) => {
        return db.get("students").find({ tag: tag }).value();
    }

    export const getStudentBySimilarName = (name) => {
        return db.get("students").value().filter(student => simplifyName(student.name) === simplifyName(name));
    }

    export const dumpAllStudents = () => {
        return db.get("students").value();
    }

    //returns filtered student list
    //with both duplicate tags removed
    //and both duplicate similar names removed
    export const getCleanStudentList = () => {
        const list = dumpAllStudents();
        // filter by tag
        const filteredByTag = list.filter((student, pos) => {
            for (let i = 0; i < list.length; i++) {
                if (student.tag === list[i].tag && pos !== i) {
                    return false;
                }
            }
            return true;
        })
        //filter by name
        const filteredByName = filteredByTag.filter((student, pos) => {
            for (let i = 0; i < filteredByTag.length; i++) {
                if (simplifyName(student.name) === simplifyName(filteredByTag[i].name) && pos !== i) {
                    return false;
                }
            }
            return true;
        })

        return filteredByName;
    }

    export const replaceStudentList = (newList) => {
        db.assign({ "students": newList }).write();
    }

    export const isStrictMode = () => {
        if (!db.get("strict_mode").value()) {
            return false
        };
        return true;
    }

    export const setStrictMode = (value) => {
        db.set("strict_mode", value).write();
    }
}