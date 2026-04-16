const { logout } = require("../../services/authentication.service")

module.exports = async (req, res)=>{
    try {
        await logout(req, res);
        res.redirect("/")
    } catch (e) {
        console.log(e)
        console.log("^^^ User logout failed! ^^^") 
    }
}