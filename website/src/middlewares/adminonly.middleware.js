const configAdmin = require("../configs/admin.config");


module.exports = (req, res, next) => {
    if(!req.user){
        res.sendStatus(401);
        return;
    }

    if(configAdmin.adminSteamIds.includes(req.user.sub)){
        next();
        return;
    }

    res.sendStatus(403);
}