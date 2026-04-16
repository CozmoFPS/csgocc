const jsonwebtoken = require("jsonwebtoken");
const configApp = require("../configs/app.config");
const configCookies = require("../configs/cookies.config");
const RefreshToken = require("../models/refreshtokens.model");
const { generateClientIdentifier } = require("../helpers/identifier.helper");
const IP = require("../models/ips.model");
const hash = require("../helpers/hash.helper");
const { Op } = require("sequelize");
const ms = require("../helpers/ms.helper");
const { revokeRefreshToken } = require("../services/authentication.service");
const { createRestriction } = require("../services/restrictions.service");
const { encrypt } = require("../helpers/encrypt.helper");
const Notification = require("../models/notification.model")
require("dotenv").config();

module.exports = async (req, res, next) => {
    req.user = false;

    let accessToken = req.cookies.auth0;
    let refreshToken = req.cookies.auth1;

    if (!accessToken && !refreshToken) {
        return next();
    }

    try {
        let refresh = jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
            'algorithms': [
                'HS512'
            ]
        });

        let access = jsonwebtoken.verify(accessToken, process.env.JWT_ACCESS_SECRET, {
            'ignoreExpiration': true,
            'algorithms': [
                'HS512'
            ]
        });

        let refreshTokenDb = await RefreshToken.findOne({
            where: {
                token: hash(refreshToken)
            }
        });

        if (!refreshTokenDb) {
            throw Error("Refresh token not found in database");
        }

        if(refreshTokenDb.dataValues.expires < Date.now()){
            throw Error("Refresh token expired");
        }

        if (refreshTokenDb.dataValues.revoked) {
            throw Error("Refresh token revoked");
        }

        if(refreshTokenDb.dataValues.identifier != generateClientIdentifier(req)){
            throw Error("Non-matching token identifier");
        }

        if(access.iss != refresh.iss || access.sub != refresh.sub){
            throw Error("Non-matching token information")
        }

        let sub = access.sub;

        let IPRecord = await IP.findOne({
            where: {
                ipHash: req.ipHash,
                steamId: sub
            }
        })

        if(IPRecord == null){
            await IP.create({
                ipHash: req.ipHash,
                steamId: sub,
                ipEncrypted: encrypt(req.ipReal)
            })
        } else {
            await IPRecord.update({
                lastSeen: new Date()
            })
        }

        let IPSecurityCheck = await IP.findAll({
            where: {
                steamId: sub,
                lastSeen: {
                    [Op.gt]: new Date(Date.now() - ms(10, "minutes"))
                }
            },
            limit: 5
        })

        if(IPSecurityCheck.length == 5){
            await revokeRefreshToken(refreshToken)
            let banPromises = [];
            banPromises.push(
                createRestriction('steamid', sub, 'blacklist', new Date(Date.now() + ms(3, "days")), "Unusual activity on your account was detected. Please consider resetting your password on Steam and activating multi-factor authentication.")
            )
            IPSecurityCheck.forEach(row=>{
                banPromises.push(
                    createRestriction('ip', row.dataValues.ip, 'siteban', new Date(Date.now() + ms(2, "weeks")), "Unusual activity was detected")
                )
            })
            Promise.all(banPromises)
            .then(()=>{
                throw Error("Unusual activity detected")
            })
            .catch(e=>{
                console.log(e)
                console.log("^^^ Security check response failed! ^^^")
                throw Error("Security check failed")
            })
        } else {
            if (access.exp * 1000 < Date.now()) {
                const newAccessToken = jsonwebtoken.sign(
                    {
                        sub
                    },
                    process.env.JWT_ACCESS_SECRET,
                    { expiresIn: "15m", 'algorithm': 'HS512', 'issuer': configApp.name } 
                );

                res.cookie("auth0", newAccessToken, {
                    'domain': configCookies.domain,
                    'httpOnly': configCookies.defaultAuthSettings.httpOnly,
                    'secure': configCookies.defaultAuthSettings.secure,
                    'sameSite': configCookies.defaultAuthSettings.sameSite
                });
            }

            req.user = {
                sub,
                unreadNotificationCount: 0
            };

            req.user.unreadNotificationCount = await Notification.count({
                where: {
                    'steamId': sub,
                    'read': false
                }
            });

            return next();
        }
    } catch (e) {
        console.error(e);
        res.clearCookie("auth0", {
            'domain': configCookies.domain,
            'httpOnly': configCookies.defaultAuthSettings.httpOnly,
            'secure': configCookies.defaultAuthSettings.secure,
            'sameSite': configCookies.defaultAuthSettings.sameSite
        });
        res.clearCookie("auth1", {
            'domain': configCookies.domain,
            'httpOnly': configCookies.defaultAuthSettings.httpOnly,
            'secure': configCookies.defaultAuthSettings.secure,
            'sameSite': configCookies.defaultAuthSettings.sameSite
        });
        return next();
    }
};
