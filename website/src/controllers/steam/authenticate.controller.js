const configApp = require("../../configs/app.config")

module.exports = (req, res)=>{
    if(req.user !== false){
        return res.redirect(`/`)
    }
    
	res.redirect(
		`https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.return_to=${configApp.baseURL}verify&openid.realm=${configApp.baseURL}&openid.mode=checkid_setup`
	)
}