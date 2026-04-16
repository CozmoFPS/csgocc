const { Op } = require("sequelize");
const APICall = require("../models/apicall.model");
const ms = require("../helpers/ms.helper");

const apiResponse = ({
    HTTPCode = 200,
    data = {},
    headers = {},
    code = null,
    success = true,
    message = null,
    res
}) => {
    res.status(HTTPCode)

    if(HTTPCode == 204){
        res.send();
        return;
    }

    for(let [key, value] of Object.entries(headers)){
        res.setHeader(key, value);
    }

    res.json({
        success,
        message,
        code,
        data
    });
}

class RateLimit {
    static ratelimits = {};

    constructor(endpoint, limit, time) {
        this.endpoint = endpoint;
        this.limit = limit;
        this.time = time;

        if(!RateLimit.ratelimits[endpoint]) {
            RateLimit.ratelimits[endpoint] = [];
        }

        RateLimit.ratelimits[endpoint].push(this);
    }

    static clean(){
        return new Promise(async (resolve, reject) => {
            try {
                const affected = await APICall.destroy({
                    where: {
                        expires: {
                            [Op.lte]: new Date()
                        }
                    }
                })

                resolve(affected)
            } catch (e) {
                reject(e)
            }
        });
    }

    record(identifier, method){
        return new Promise(async (resolve, reject) => {
            try {
                const record = await APICall.create({
                    endpoint: this.endpoint,
                    method,
                    identifier,
                    expires: new Date(Date.now() + this.time)
                })

                resolve(record)
            } catch (e) {
                reject(e)
            }
        });
    }

    check(identifier, method, autoRecord=true){
        return new Promise(async (resolve, reject) => {
            try {
                const records = await APICall.findAll({
                    where: {
                        identifier,
                        method,
                        endpoint: this.endpoint
                    }
                });

                let now = new Date(Date.now());
                const validRecords = records.filter(record => record.expires > now);
                let returnData = {
                    success: true,
                    interval: this.time,
                    records: validRecords.length,
                    maxRecords: this.limit
                }
                let offendingRecords = validRecords.filter(record => (now - record.dataValues.created) < this.time);

                if(offendingRecords.length >= this.limit){
                    returnData.success = false;
                }

                if(returnData.success && autoRecord){
                    await this.record(identifier, method)
                }

                resolve(returnData)
            } catch (e) {
                reject(e)
            }
        });
    }
}

new RateLimit("/api/profile",
    10,
    ms(10, "seconds")
);

const rateLimitCleanupInterval = 1800 * 1000

async function consistentRateLimitCleanup(){
    try {
        const cleanup = await RateLimit.clean()
        console.log(`${cleanup} old rate limit record${cleanup == 1 ? '' : 's'} were deleted`);
        setTimeout(consistentRateLimitCleanup, rateLimitCleanupInterval)
    } catch (e) {
        console.log(e)
        console.log("^^^ Rate limit cleanup failed! ^^^")
    }
}

consistentRateLimitCleanup();

module.exports = {
    apiResponse,
    RateLimit
}