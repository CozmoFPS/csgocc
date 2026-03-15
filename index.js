console.log('CSGOCC is starting up')
const { app } = require("./src/services/webapp.service");

const { modelSyncPromises } = require("./src/models");
const { resolveSteamId, getSteamData } = require("./src/services/steamdata.service");

Promise.all(modelSyncPromises)
.then(async ()=>{
    console.log("Database connected successfully");
    const { LocaleText } = require("./src/services/locale.service")
    LocaleText.compile()

    
    require("./src/routers");
    require("./src/services/games.service")

    const id = await resolveSteamId("https://steamcommunity.com/profile/76561198169903401");
    console.log(id)
    const sdata = await getSteamData(id);
    console.log(sdata)
})
.catch((err)=>{ 
    console.error(err);
    console.log("^^^ CRITICAL APP FAILURE ^^^")
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

module.exports = app