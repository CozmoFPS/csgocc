const axios = require('axios')
const jsonwebtoken = require("jsonwebtoken");
const configApp = require('../configs/app.config');
const configCookies = require('../configs/cookies.config');
const ms = require("../helpers/ms.helper");
const RefreshToken = require('../models/refreshtokens.model');
const { Op } = require('sequelize');
const { generateClientIdentifier } = require('../helpers/identifier.helper');
const hash = require('../helpers/hash.helper');
const Personalization = require('../models/personalization.model');
const { getSteamData } = require('./steamdata.service');
require("dotenv").config()

class SteamVerificationError {
    constructor(details, data){
        this.details = details;
        this.data = data;
    }
}

function verifySteamData(query){
    return new Promise(async (resolve, reject) => {
        try {
            query["openid.mode"] = "check_authentication"
            axios.get(
                `https://steamcommunity.com/openid/login`, { params: query, headers: { "Content-Type": 'text/plain' } }
            )
            .then(verification=>{
                const data = verification.data
                if(data.includes("is_valid:true")){
                    return resolve()
                } else if(data.includes("is_valid:false")){
                    return reject(new SteamVerificationError("Steam could not verify that the OpenID data is authentic", data))
                } else {
                    return reject(new SteamVerificationError("Steam returned an invalid response", data))
                }
            })
            .catch(e=>{
                return reject(new SteamVerificationError("Steam's verification servers could not be reached. Maintenance may be in progress", e))
            })
            
        } catch (e) {
            let error;
            error = new SteamVerificationError("An unknown verification error occurred", e)
            reject(error)
        }
    });
}

function revokeRefreshToken(refreshToken){
    return new Promise(async (resolve, reject) => {
        try {
            await RefreshToken.update({
                revoked: true
            }, {
                where: {
                    token: hash(refreshToken)
                }
            }) 

            resolve(true)
        } catch (e) {
            reject(e)
        }
    });
}

function login(steamID, req, res){
    return new Promise(async (resolve, reject) => {
        try {
            let personalizationExists = (await Personalization.findOne({
                where: {
                    steamId: steamID,
                    type: 'avatar'
                }
            }));

            console.log('pe: ', personalizationExists)

            if(!personalizationExists){
                let steamAvatar;
                let steamNickname = steamID

                getSteamData(steamID)
                .then(data=>{
                    steamAvatar = data.avatarURL
                    steamNickname = data.nickname
                })
                .catch(e=>{
                    console.log(e)
                    console.log('^^^ Failed to get steam data for new login ^^^')
                })
                .finally(async ()=>{
                    if(steamAvatar){
                        await Personalization.create({
                            steamId: steamID,
                            type: 'avatar',
                            content: steamAvatar
                        })
                    }

                    await Personalization.create({
                        steamId: steamID,
                        type: 'nickname',
                        content: steamNickname
                    })
                })
            }

            res.cookie("auth0", jsonwebtoken.sign({
                sub: steamID
            }, process.env.JWT_ACCESS_SECRET, {
                'algorithm': 'HS512',
                'issuer': configApp.name,
                'expiresIn': '15m'
            }), {
                'domain': configCookies.domain,
                'httpOnly': configCookies.defaultAuthSettings.httpOnly,
                'secure': configCookies.defaultAuthSettings.secure,
                'sameSite': configCookies.defaultAuthSettings.sameSite
            })

            const refreshToken = jsonwebtoken.sign({
                sub: steamID
            }, process.env.JWT_REFRESH_SECRET, {
                'algorithm': 'HS512',
                'issuer': configApp.name,
                'expiresIn': '30d'
            });

            await RefreshToken.create({
                token: hash(refreshToken),
                identifier: generateClientIdentifier(req),
            })

            res.cookie("auth1", refreshToken, {
                'domain': configCookies.domain,
                'httpOnly': configCookies.defaultAuthSettings.httpOnly,
                'secure': configCookies.defaultAuthSettings.secure,
                'sameSite': configCookies.defaultAuthSettings.sameSite,
                'expires': new Date(Date.now() + ms(30, "days"))
            })

            resolve()
        } catch (e) {
            reject(e)
        }
    });
}

function logout(req, res){
    return new Promise(async (resolve, reject) => {
        try {
            let refreshToken = req.cookies.auth1;
            if (!refreshToken) {
                return resolve();
            }

            await revokeRefreshToken(refreshToken)

            res.clearCookie("auth1", {
                'domain': configCookies.domain,
                'httpOnly': configCookies.defaultAuthSettings.httpOnly,
                'secure': configCookies.defaultAuthSettings.secure,
                'sameSite': configCookies.defaultAuthSettings.sameSite
            })
            res.clearCookie("auth0", {
                'domain': configCookies.domain,
                'httpOnly': configCookies.defaultAuthSettings.httpOnly,
                'secure': configCookies.defaultAuthSettings.secure,
                'sameSite': configCookies.defaultAuthSettings.sameSite
            })
            resolve()
        } catch (e) {
            reject(e);
        }
    });
}

function deleteOldRefreshTokens(){
    return new Promise(async (resolve, reject) => {
        try {
            const affected = await RefreshToken.destroy({
                where: {
                    expires: {
                        [Op.lt]: new Date()
                    }
                }
            });

            resolve(affected)
        } catch (e) {
            reject(e)
        }
    });
}

function deleteOldRefreshTokensRoutine(){
    deleteOldRefreshTokens()
    .then(affected => {
        console.log(`Deleted ${affected} expired refresh tokens`)    
    })
    .catch(e => {
        console.error(e)
        console.log("^^^ Refresh token clean up failed! ^^^")
    })
    .finally(() => {
        setTimeout(() => {
            deleteOldRefreshTokensRoutine()
        }, ms(1, "hours"))
    })
}

deleteOldRefreshTokensRoutine()

module.exports = { verifySteamData, login, logout, revokeRefreshToken } 