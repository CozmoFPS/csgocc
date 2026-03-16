require("dotenv").config();
const { Op } = require("sequelize");
const modelSteamData = require("../models/steamdata.model");
const modelSteamCall = require("../models/steamcall.model");
const ms = require("../helpers/ms.helper");
const SteamData = require("../models/steamdata.model");
const URLCheck = require("../helpers/urlcheck.helper");
const { getCache } = require("./cache.service");
const fetch = require('node-fetch')

const regexSteamIDStandard = /^STEAM_[0-5]:[01]:\d+$/;
const regexSteamID3 = /^\U:1:\d+$/;
const regexSteamID64 = /^7656119\d{10}$/;
const regexSteamIDCustom = /^[a-zA-Z0-9_.-]{3,32}$/;

const steamDataLimitReached = function(){
    return new Promise(async (resolve) => {
        try {
            const rows = await modelSteamCall.count({
                'where': {
                    'expires': {
                        [Op.gt]: new Date()
                    }
                }
            })

            resolve(rows >= 90000);
        } catch (e) {
            console.log(e);
            console.log("^^^ Steam data limit check failed! ^^^")
            resolve(null)  
        }
    });
}

const steamDataGetCache = function(steamId){
    console.log(`Fetching from cache: ${steamId}`)
    return new Promise(async (resolve) => {
        try {
            const check = await SteamData.findOne({
                where: {
                    'steamId': steamId,
                    'expires': {
                        [Op.gt]: new Date()
                    }
                }
            })

            resolve(check);
        } catch (e) {
            console.log(e);
            console.log("^^^ Steam data ID existence check failed! ^^^");
            resolve(null);
        }
    });
}

const steamResolveCustomId = function(customId){
    return new Promise(async (resolve, reject) => {
        try {
            await modelSteamCall.create({
                'description': "customIdResolution"
            });

            /*
            const check = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${customId}`);
            const json = await check.json();
            resolve(json.response.steamid || null);
            return;
            */

            let queue = new SteamDataFetchQueue('idresolve');
            queue.add(customId, result=>{
                if(!result.success){
                    throw result.data;
                }

                resolve(result.data.response.steamid);
            })
        } catch (e) {
            console.log(e);
            console.log("^^^ Steam data custom ID resolution failed! ^^^")
            resolve(null);
        }
    });
}

const resolveSteamId = function(steamId){
    return new Promise(async (resolve, reject) => {
        try {
            let cache = getCache({
                key: "SteamIDResolution",
                identifier: steamId
            });

            if(cache){
                resolve(cache.value);
                return;
            }

            if(steamId.startsWith("[") && steamId.endsWith("]")){
                steamId = steamId.substring(1, steamId.length - 1);
            }

            regexSteamID64.test(steamId)
            if(regexSteamID64.test(steamId)){
                resolve(steamId);
                return;
            }

            if(regexSteamIDStandard.test(steamId)){
                let partsStandard = steamId.split(":");
                let steamIdStandardTo64 = 76561197960265728n + (BigInt(partsStandard[2]) * 2n) + BigInt(partsStandard[1]);
                resolve(String(steamIdStandardTo64));
                return;
            }

            if(regexSteamID3.test(steamId)){
                let parts3 = steamId.split(":");
                let steamId3To64 = 76561197960265728n  + (BigInt(parts3[2]));
                resolve(String(steamId3To64));
                return;
            }

            let steamIDURL = URLCheck(steamId);

            if(
                steamIDURL !== false &&
                steamIDURL.hostname == 'steamcommunity.com' &&
                steamIDURL.pathname.startsWith("/profile/")
            ){
                let partsDefaultURL = steamIDURL.pathname.split("/");
                let steamDefaultID = partsDefaultURL[2];
                if(regexSteamID64.test(steamDefaultID)){
                    resolve(steamDefaultID);
                    return;
                }
            }

            let steamCustomID = steamId;
            if(
                steamIDURL !== false &&
                steamIDURL.hostname == 'steamcommunity.com' &&
                steamIDURL.pathname.startsWith("/id/")
            ){
                let partsCustomURL = steamIDURL.pathname.split("/");
                steamCustomID = partsCustomURL[2];
            } 

            if(!regexSteamIDCustom.test(steamCustomID)){
                resolve(null);
                return;
            }

            let steamIdCustomTo64Cache = await modelSteamData.findOne({
                where: {
                    'customSteamId': steamCustomID,
                    'expires': {
                        [Op.gt]: new Date()
                    }
                },
                attributes: ['steamId']
            })

            if(steamIdCustomTo64Cache != null){
                resolve(steamIdCustomTo64Cache.dataValues.steamId);
                return;
            }

            if(await steamDataLimitReached()){
                resolve(null);
                return;
            }

            const steamIdCustomTo64 = await steamResolveCustomId(steamCustomID);
            if(steamIdCustomTo64 != null){
                modelSteamData.upsert({
                    'steamId': steamIdCustomTo64,
                    'customSteamId': steamCustomID,
                    'expires': new Date(Date.now() + ms(4, "weeks"))
                }).catch((e) => {
                    console.log(e);
                    console.log("^^^ Steam data custom ID cache failed! ^^^")
                })
                resolve(steamIdCustomTo64);
                return;
            }

            resolve(null);
        } catch (e) {
            console.log(e);
            console.log("^^^ Steam ID resolution failed! ^^^")
            resolve(null);
        }
    });
}

class SteamDataFetchResult {
    constructor(success, data){
        this.success = success;
        this.data = data;
    }
}

class SteamDataFetchQueue {
    static backoffDuration = 30000
    static backoff = {}
    static queues = [];
    static steamIdQueues = {};
    static queueLimit = 100;
    static extraQueueTimeout = 1000;
    static turn;
    static nextFetchAllowedAfter = Date.now();
    static fetchCooldown = 1000;

    constructor(type='summary'){
        this.id = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        this.queue = {};
        this.queueLength = 0;
        this.active = false;
        this.lastQueueAddition = Date.now();
        this.type = type;

        SteamDataFetchQueue.queues.push(this);
        if(!SteamDataFetchQueue.turn){
            SteamDataFetchQueue.turn = this.id;
        }

        this.controller();
    }

    static getRelevantQueue(){
        let relevant;

        for(let queueObject of SteamDataFetchQueue.queues){
            if(
                queueObject.queueLength < SteamDataFetchQueue.queueLimit &&
                !queueObject.active
            ){
                relevant = queueObject;
                break;
            }
        }

        if(!relevant){
            relevant = new SteamDataFetchQueue()
        }

        return relevant;
    }

    static fetch(steamId){
        return new Promise((resolve) => {
            let backoff = SteamDataFetchQueue.backoff[steamId];
            if(backoff && backoff > Date.now()){
                resolve(new SteamDataFetchResult(false, "This Steam ID is in back-off mode"));
                return;
            }

            let queue = SteamDataFetchQueue.getRelevantQueue()
            queue.add(steamId, result =>{
                resolve(result)
            })
        });
    }

    controller(){
        let last = this.lastQueueAddition
        setTimeout(()=>{
            if(this.id == SteamDataFetchQueue.turn && Date.now() >= SteamDataFetchQueue.nextFetchAllowedAfter && (this.lastQueueAddition == last || this.queueLength >= SteamDataFetchQueue.queueLimit)){
                this.activate();
            } else {
                this.controller();
            }
        }, SteamDataFetchQueue.extraQueueTimeout);
    }

    activate(){
        if(this.active){
            return;
        }

        this.active = true;
        let queueSteamIds = Object.keys(this.queue)

        const callbackResponse = (steamId, response)=>{
            let callbacks = this.queue[steamId];
            if(callbacks){
                callbacks.forEach(callback=>{
                    callback(response);
                })
            }
            
            delete this.queue[steamId];
        }

        const fetchErrorHandler = (e)=>{
            let failure = new SteamDataFetchResult(false, e);
            queueSteamIds.forEach(steamId=>{
                callbackResponse(steamId, failure)
            })
        }

        let fetchURL = this.type == 'summary' ?
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${queueSteamIds.join(",")}` :
            `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${queueSteamIds[0]}`

        console.log(`Steam request ran at ${new Date().toLocaleTimeString()}: ${fetchURL}`)
        fetch(
            fetchURL
        )
        .then(async request => {
            try {
                if(request.status == 429){
                    queueSteamIds.forEach(steamId=>{
                        SteamDataFetchQueue.backoff[steamId] = Date.now() + SteamDataFetchQueue.backoffDuration;
                    })
                    throw Error("Rate limited");
                }
                let json = await request.json();

                if(this.type != 'summary'){
                    let idresolve = new SteamDataFetchResult(true, json);
                    callbackResponse(queueSteamIds[0], idresolve);
                    return;
                }

                json.response.players.forEach(player => {
                    let steamId = player.steamid;
                    let success = new SteamDataFetchResult(true, player);
                    callbackResponse(steamId, success)
                });

                for(let steamId of Object.keys(this.queue)){
                    let notfound = new SteamDataFetchResult(false, "Not Found");
                    callbackResponse(steamId, notfound)
                }
            } catch (e) {
                fetchErrorHandler(e)
            }
        })
        .catch(e => {
            fetchErrorHandler(e)
        })
        .finally(()=>{
            queueSteamIds.forEach(steamId=>{
                delete SteamDataFetchQueue.steamIdQueues[steamId];
            })

            let selfIndex = SteamDataFetchQueue.queues.indexOf(this);
            if(selfIndex >= 0)SteamDataFetchQueue.queues.splice(selfIndex, 1)
            SteamDataFetchQueue.nextFetchAllowedAfter = Date.now() + SteamDataFetchQueue.fetchCooldown
            let nextQueue = SteamDataFetchQueue.queues[0];
            SteamDataFetchQueue.turn = nextQueue ? nextQueue.id : undefined;
        })
    }

    add(steamId, callback){
        let existing = SteamDataFetchQueue.steamIdQueues[steamId];
        if(existing && existing.id != this.id){
            existing.add(steamId, callback);
            return;
        }

        //console.log("Queueing: ", steamId)

        SteamDataFetchQueue.steamIdQueues[steamId] = this;

        if(!this.queue[steamId]){
            this.queue[steamId] = [];
        }

        let steamIdQueue = this.queue[steamId];
        steamIdQueue.push(callback);
        this.lastQueueAddition = Date.now();
        this.queueLength += 1
    }
}

// This ONLY takes 64-bit Steam ID's. Resolve and validate data before using this.
const getSteamData = function(steamId){
    return new Promise(async (resolve, reject) => {
        try {
            const steamDataCache = await steamDataGetCache(steamId);

            if(
                steamDataCache != null &&
                steamDataCache.avatarURL != null &&
                steamDataCache.nickname != null
            ){
                resolve({
                    'steamId': steamDataCache.steamId,
                    'avatarURL': steamDataCache.avatarURL,
                    'nickname': steamDataCache.nickname
                });
                return;
            }

            if(await steamDataLimitReached()){
                resolve(null);
                return;
            }

            await modelSteamCall.create({
                'description': "steamDataResolution"
            });
            
            let steamDataFetchResult = await SteamDataFetchQueue.fetch(steamId);
            let steamDataFetch = steamDataFetchResult.data;

            if(!steamDataFetchResult.success){
                console.error(steamDataFetch)
                console.log('^^^ Steam data fetch failed! ^^^');
                resolve(null);
                return;
            }

            const avatarURL = steamDataFetch.avatarfull;
            const nickname = steamDataFetch.personaname;

            let customId;
            let profileURL = steamDataFetch.profileurl;
            if(
                profileURL !== undefined &&
                profileURL.includes("/id/")
            ){
                let profileURLsplit = profileURL.split("/");
                customId = profileURLsplit[4];
                if(!regexSteamIDCustom.test(customId)){
                    customId = undefined;
                }
            }

            if(customId){
                let customIdExistence = await modelSteamData.findOne({
                    where: {
                        'customSteamId': customId,
                        'expires': {
                            [Op.gt]: new Date()
                        }
                    }
                });

                if(customIdExistence != null){
                    await customIdExistence.update({
                        'customSteamId': null
                    });
                }
            }

            await SteamData.upsert({
                'steamId': steamId,
                'avatarURL': avatarURL,
                'nickname': nickname,
                'expires': new Date(Date.now() + ms(7 + Math.random() * 3, "days")),
                'customSteamId': customId
            });

            resolve({
                'steamId': steamId,
                'avatarURL': avatarURL,
                'nickname': nickname
            });
        } catch (e) {
            console.log(e)
            console.log("^^^ Steam data resolution failed! ^^^")
            resolve(null);
        }
    });
}

function steamCleanup(){
    return new Promise(async (resolve, reject) => {
        try {
            const oldSteamDataRows = await modelSteamData.destroy({
                where: {
                    'expires': {
                        [Op.lt]: new Date()
                    }
                }
            });

            const oldSteamCallRows = await modelSteamCall.destroy({
                where: {
                    'expires': {
                        [Op.lt]: new Date()
                    }
                }
            });

            resolve({
                'steamData': oldSteamDataRows,
                'steamCall': oldSteamCallRows
            });
        } catch (e) {
            reject(e);  
        }
    });
}

function steamCleanupRoutine(){
    steamCleanup()
    .then((result) => {
        console.log("Steam data cleanup completed", result);
    })
    .catch((err) => {
        console.log(err);
        console.log("^^^ Steam data cleanup failed! ^^^");
    })
    .finally(() => {
        setTimeout(steamCleanupRoutine, ms(1, "hours"));
    });
}

steamCleanupRoutine();

module.exports = {
    resolveSteamId,
    getSteamData
}