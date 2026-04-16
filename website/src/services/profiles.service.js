const Agreement = require("../models/agreements.model");

function submitPolicyAgreement(steamId){
    return new Promise(async (resolve, reject) => {
        try {
            let existing = await Agreement.findOne({
                where: {
                    'active': true,
                    'steamId': steamId
                }
            });

            if(existing){
                resolve(null);
                return;
            }

            const agreement = await Agreement.create({
                'steamId': steamId
            });

            resolve(agreement)
        } catch (e) {
            reject(e)
        }
    });
}

module.exports = { submitPolicyAgreement }