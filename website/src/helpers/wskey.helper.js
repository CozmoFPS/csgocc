require('dotenv').config()
const { encrypt } = require('./encrypt.helper')

function genWSKey(sub){
    return encrypt(JSON.stringify({
        sub: sub,
        time: Date.now()
    }), process.env.WS_ENCRYPT_KEY)
}

module.exports = genWSKey