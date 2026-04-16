const { db } = require("../services/db.service")

module.exports = async (req, res, next) => {
    try {
        await db.authenticate();
        next();
    } catch (e) {
        console.log(e)
        console.log("^^^ Catostrophic failure! ^^^")
        res.render("pages/maintenance.ejs");
    }
}