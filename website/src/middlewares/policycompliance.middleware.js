const Agreement = require("../models/agreements.model");
const { apiResponse } = require("../services/api.service");

const redirectPages = [
    "/",
]

module.exports = async (req, res, next) => {
    try {
        if(!req.user){
            next();
            return;
        }
        
        let validAgreement = await Agreement.findOne({
            where: {
                'steamId': req.user.sub,
                'active': true
            }
        });

        req.agreementNeeded = !validAgreement

        next();
    } catch (e) {
        console.log(e)
        console.log("^^^ Failed to verify policy compliance! ^^^");
        apiResponse({
            HTTPCode: 500,
            success: false,
            message: "Failed to verify policy compliance",
            res
        })
    }
}