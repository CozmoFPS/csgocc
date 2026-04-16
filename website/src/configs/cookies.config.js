require("dotenv").config()

const configCookies = {
    domain: process.env.MODE == "DEV" ? "localhost" : "csgocompetitive.com",
    defaultAuthSettings: {
        httpOnly: true,
        secure: true,
        sameSite: process.env.MODE == "DEV" ? 'none' : 'strict'
    }
}

module.exports = configCookies