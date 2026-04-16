const elorankHelper = require("../helpers/elorank.helper");
const Gamestats = require("../models/gamestats.model");
const configAdmin = require('../configs/admin.config');
const Personalization = require("../models/personalization.model");
const Restriction = require("../models/restriction.model");
const genWSKey = require("../helpers/wskey.helper");

let autoPageNames = [
    'play',
    'users',
    'donate',
    'settings',
    'loadout',
    'premium'
]

module.exports = async (req, res, next) => {
    let url = req.url

    res.locals.user = req.user
    res.locals.agreementNeeded = req.agreementNeeded

    let pageName = url.split('/pages/')[1];
    let autoPage = url.split('/')[1];
    if(autoPageNames.includes(autoPage)){
        res.locals.page = autoPage
    } else {
        res.locals.page = null
    }

    if(!pageName){
        res.locals.admin = false;
        res.locals.rank = null;
        res.locals.wins = null;
        res.locals.avatar = null;
        res.locals.nickname = null;
        res.locals.wskey = null;
        res.locals.restrictionType = null;
        res.locals.restrictionExpires = null;
        res.locals.restrictions = [];

        if(req.user){
            let userGamestats = (await Gamestats.findOrCreate({
                where: {
                    steamId: req.user.sub
                },
                attributes: ['steamId', 'elo', 'wins']
            }))[0];

            let rank = elorankHelper(userGamestats.dataValues.elo)
            res.locals.rank = rank
            res.locals.wins = userGamestats.dataValues.wins
            

            if(configAdmin.adminSteamIds.includes(req.user.sub)){
                res.locals.admin = true
            }

            let pAvatar = await Personalization.findOne({
                where: {
                    steamId: req.user.sub,
                    type: 'avatar'
                },
                order: [['created', 'DESC']]
            })

            let pNickname = await Personalization.findOne({
                where: {
                    steamId: req.user.sub,
                    type: 'nickname'
                },
                order: [['created', 'DESC']]
            })

            res.locals.avatar = pAvatar?.content || null;
            res.locals.nickname = pNickname?.content || null;

            let steamIdRestrictions = await Restriction.findAll({
                where: {
                    subject: `steamid:${req.user.sub}`
                }
            })

            let steamIdRestrictionsFront = [];
            steamIdRestrictions.forEach(restriction=>{
                steamIdRestrictionsFront.push({
                    created: restriction.created,
                    type: restriction.type,
                    expires: restriction.expires,
                    id: restriction.id
                })
            })

            res.locals.restrictions = steamIdRestrictionsFront

            res.locals.wskey = genWSKey(req.user.sub);
        }
    }

    next()
}