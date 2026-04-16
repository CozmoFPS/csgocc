console.log('CSGOCC Matchmaking is starting up')

const { modelSyncPromises } = require("./src/models");

Promise.all(modelSyncPromises)
.then(async ()=>{
    console.log("Database connected successfully");
    require("./src/services/matchmaking.service")
})
.catch((err)=>{ 
    console.error(err);
    console.log("^^^ CRITICAL APP FAILURE ^^^")
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});