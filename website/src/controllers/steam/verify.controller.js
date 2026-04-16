const { verifySteamData, login } = require("../../services/authentication.service");

module.exports = (req, res)=>{
    if(req.user !== false){
        return res.redirect(`/`)
    }
    const query = req.query;
    verifySteamData(query)
    .then(async ()=>{
        try {
            let steamID = query["openid.identity"].split("id/")[2]
            console.log(steamID)
            if(!steamID){
                console.error("Invalid Steam ID")
                return res.redirect(`/?error=1`)
            }
            await login(steamID, req, res)
            req.user = {
                sub: steamID
            };
            res.redirect(`/`)
        } catch(e){
            console.error(e)
            res.redirect(`/?error=1`)
        }
    })
    .catch(e=>{
        res.redirect(`/?error=1`)
        console.error(e)
    })
}