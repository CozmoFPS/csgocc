const dateIn = require("../helpers/datein.helper");
const hash = require("../helpers/hash.helper");
const reqIP = require("../helpers/reqip.helper");
const modelRestrictions = require("../models/restriction.model");
const { apiResponse } = require("../services/api.service");

module.exports = async (req, res, next) => {
    try {
        let ip = reqIP(req);

        if(!ip){
            res.status(400).send("Error");
            return;
        }

        ip = hash(ip);

        let restriction = await modelRestrictions.findOne({
            where: {
                subject: `ip:${ip}`,
                type: "IPBan"
            }
        });

        if(restriction){
            res.status(403).send(`
            <h1>Access Denied</h1>
            <p>Your IP address has been blocked.</p>
            <p><strong>Reason:</strong> ${restriction.description}</p>
            <p><strong>Expires:</strong> ${restriction.expires == null ? "Never" : dateIn(restriction.expires)}</p>
            <p><strong>Appeals:</strong> <a href="mailto:appeals@csgocompetitive.com">appeals@csgocompetitive.com</a></p>
            `);
            return;
        }

        req.ipReal = ip;
        req.ipHash = ip;
        next();
    } catch (e) {
        console.log(e)
        console.log("^^^ Site ban check failed! ^^^")
        apiResponse({
            HTTPCode: 500,
            success: false,
            message: "Failed to make site ban comparison",
            res
        })
    }
}