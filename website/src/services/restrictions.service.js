const Restriction = require("../models/restriction.model");


function createRestriction(subjectType, subject, restrictionType, expires, description, code=null){
    let subjectCompiled = `${subjectType}:${subject}`;
    return new Promise(async (resolve, reject) => {
        try {
            let restriction = await Restriction.create({
                expires: expires || null,
                subject: subjectCompiled,
                description,
                restrictionType,
                code
            })

            resolve(restriction)
        } catch (e) {
            reject(e)
        }
    });
}

module.exports = {
    createRestriction
}