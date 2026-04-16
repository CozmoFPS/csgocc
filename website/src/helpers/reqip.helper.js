require("dotenv").config()

function reqIP(req){
    let ip;
    let forwarded = req.headers['x-forwarded-for'];
    if(forwarded !== undefined && typeof forwarded == 'string'){
        let forwardSplit = forwarded.split(",");
        ip = forwardSplit[0];
    }

    if(!ip && process.env.MODE == "DEV"){
        ip =req.socket.remoteAddress;
    }

    return ip;
}

module.exports = reqIP