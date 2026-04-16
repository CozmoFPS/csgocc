require("dotenv").config();

const configApp = {
    name: "CSGO Community Competitive",
    baseURL: process.env.MODE == "DEV" ? "http://localhost:3000/" : "https://www.csgocompetitive.com/",
    corsWhitelist: [
        "http://localhost:2000",
        "http://localhost:3000",
        "https://csgocompetitive.com",
        "https://www.csgocompetitive.com",
        "https://avatars.steamstatic.com"
    ],
    localSecure: false
}

if(process.env.MODE == "DEV" && configApp.localSecure === true){
    configApp.baseURL = "https://localhost:3000"
}

module.exports = configApp;