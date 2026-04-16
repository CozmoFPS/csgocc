const reqIP = require("../helpers/reqip.helper");
const { RateLimit, apiResponse } = require("../services/api.service");
require("dotenv").config();

const middlewareRateLimits = async (req, res, next) => {
    try {
        let secretCheck = req.headers['rl-bypass'] == 'vuy&4lvigHM@*Y^A';

        if(secretCheck){
            next();
            return;
        }

        let identifier = req.user?.sub || reqIP(req);
        console.log("RL Ident: ", identifier)

        if(!identifier){
            apiResponse({
                HTTPCode: 400,
                message: "No valid identifier was found",
                success: false,
                res
            });

            return;
        }

        let url = new URL(`http://localhost${req.url}`);
        let path = url.pathname;
        const ratelimits = RateLimit.ratelimits[path];
        //console.log("RL: ", path)
        if(!ratelimits || ratelimits.length == 0){
            next();
            return;
        }

        let checks = [];

        ratelimits.forEach(ratelimit => {
            checks.push(ratelimit.check(identifier, req.method))
        })

        Promise.all(checks)
        .then(checks=>{
            if(checks.filter(check => check.success === false).length > 0){
                apiResponse({
                    'HTTPCode': 429,
                    'message': "Rate limit for this endpoint has been met or exceeded",
                    'success': false,
                    res,
                    data: checks
                })
            } else {
                next()
            }
        })
        .catch(e=>{
            throw e
        })
    } catch (e) {
        console.log(e)
        console.log("^^^ Rate limit check failed! ^^^")
        apiResponse({
            HTTPCode: 500,
            message: "Rate limit check failed",
            success: false,
            res
        })
    }
    
}

module.exports = middlewareRateLimits;