const { WebSocketServer } = require('ws')
const { server } = require('./webapp.service')
const wss = new WebSocketServer({
    server: server
})
const crypto = require('crypto')

class PlayerQueue {
    static queued = {}

    constructor(steamId){
        this.steamId = steamId;

        this.queueStatus = 'WAITING' // WAITING, PENDING, ACCEPTED, PLAYING
    }
}

class PlayerConnection {
    static users = {}
    static unregistered = {}
    static inactivityCheckInterval = 20000
    static unregisteredExpiration = 30000
    static maxActiveConnections = 5
    
    static maxConnections(steamId){
        let connections = PlayerConnection.users[steamId];
        if(!connections)return false;
        return Object.keys(connections).length >= PlayerConnection.maxActiveConnections
    }

    constructor(steamId, res){
        this.steamId = steamId;
        this.status = 'PENDING' // PENDING, ACTIVE
        this.key = crypto.randomBytes(32).toString('hex')
        this.created = Date.now()
        this.socket;
        res.locals.wskey = this.key;
        
        if(!PlayerConnection.users[steamId]){
            PlayerConnection.users[steamId] = {}
        }

        PlayerConnection.users[steamId][this.key] = this
        PlayerConnection.unregistered[this.key] = this;
    }

    register(socket){
        this.socket = socket;
        delete PlayerConnection.unregistered[this.key];
        this.status = 'ACTIVE'

        socket.on('close', ()=>{
            this.destroy()
        })

        socket.send(JSON.stringify({
            action: 'confirmRegistered'
        }))
    }

    destroy(){
        delete PlayerConnection.unregistered[this.key]
        delete PlayerConnection.users[this.steamId][this.key]
    }

    static async unregisteredCleanup(){
        for(let [_, connection] of Object.entries(PlayerConnection.unregistered)){
            if(Date.now() - connection.created >= PlayerConnection.unregisteredExpiration){
                connection.destroy();
            }
        }
    }
}

wss.on('connection', (socket, request) => {
    socket.on('message', event=>{
        let str = event.toString()
        try {
            let data = JSON.parse(str);
            if(data.action == 'register'){
                if(data.role == 'user'){
                    let key = data.key;
                    if(!key){
                        socket.close()
                        return;
                    }

                    let connection = PlayerConnection.unregistered[key];
                    if(!connection){
                        socket.close();
                        return;
                    }

                    socket.removeAllListeners()
                    connection.register(socket);
                }
            }
        } catch (_){
            socket.close()
        }
    })
})

module.exports = { PlayerConnection }