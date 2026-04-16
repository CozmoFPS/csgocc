require('dotenv')
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running');
});
server.listen(4000, () => {
    console.log('Server is listening on port 4000');
});

const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({
    server: server
})
const { decrypt } = require('../helpers/encrypt.helper');
const { randomBytes } = require('crypto');
const { default: xss } = require('xss');

class Lobby {
    static lobbies = {};

    static broadcastStats(){
        let statsCompiled = {
            online: Object.keys(Player.players).length,
            inQueue: Object.values(Lobby.lobbies).filter(lobby => lobby.status === 'QUEUED').reduce((a, lobby) => a + lobby.players.length, 0),
            activeGames: Object.values(Lobby.lobbies).filter(lobby => lobby.status === 'INGAME').length
        }
    }

    constructor(leader){
        this.players = [leader]
        this.leaderIndex = 0
        this.status = 'IDLE' // IDLE, QUEUED, PENDING, INGAME
        this.queueRestrictions = [];
        this.id = randomBytes(16).toString('hex');
        this.pendingInvites = [];
        Lobby.lobbies[this.id] = this;
    }

    // Broadcasts the current lobby state to all players
    broadcast(data){
        let compiledData = data;

        if(!data){
            compiledData = {
                meta: {
                    type: 'lobbyStateUpdate'
                },
                players: {},
                id: this.id,
                status: this.status,
                queueRestrictions: this.queueRestrictions,
                leaderIndex: this.leaderIndex
            }

            for(let player of this.players){
                compiledData.players[player.sub] = {
                    sub: player.sub,
                }
            }
        }

        this.players.forEach(player => {
            player.sendMessage(compiledData)
        })
    }

    genericMessage(message){
        this.broadcast({
            meta: {
                type: 'genericMessage'
            },
            message
        })
    }

    isLeader(player){
        let leader = this.players[this.leaderIndex];
        return leader.sub === player.sub;
    }

    // Changes the lobby leader to another player that is either defined or random
    selectNewLeader(playerSub){
        let newLeaderIndex;

        if(!this.players || this.players.length == 0){
            return;
        }

        if(playerSub){
            for(let player of this.players){
                if(player.sub == playerSub){
                    newLeaderIndex = this.players.indexOf(player);
                    break;
                }
            }
        }

        if(!playerSub || newLeaderIndex === undefined){
            newLeaderIndex = Math.floor(Math.random() * this.players.length);
        }

        this.leaderIndex = newLeaderIndex;
        this.pendingInvites = [];
    }

    // Adds a new player to the lobby
    playerAdd(player){
        if(this.players.length >= 5){
            return;
        }

        if(player.lobby == this){
            return;
        }

        if(player.lobby.status != 'IDLE'){
            return;
        }

        if(this.status != 'IDLE'){
            return;
        }

        this.players.push(player)

        if(player.lobby){
            player.lobby.playerRemove(player);
        }

        player.lobby = this;
        this.broadcast();
        return true;
    }

    // Removes a player that is a member of the lobby
    playerRemove(player){
        console.log('premove called')
        let playerIndex = this.players.indexOf(player);
        console.log(playerIndex)
        if(playerIndex === undefined){
            return;
        }
        

        this.players.splice(playerIndex, 1);

        if(this.players.length > 0){
            if(playerIndex == this.leaderIndex){
                this.selectNewLeader();
            }
            
            this.status = 'IDLE';
        } else {
            delete Lobby.lobbies[this.id];
        }

        this.broadcast()
    }

    queueStart(){
        if(this.queueRestrictions.length > 0)return;
        if(this.status !== 'IDLE' || this.status == 'QUEUED')return;
        this.status = 'QUEUED';
        this.broadcast();
    }

    queueStop(){
        if(this.status !== 'QUEUED' || this.status == 'IDLE')return;
        this.status = 'QUEUED';
        this.broadcast();
    }

    sendInvite(sub){
        let player = Player.players[sub];
        console.log(player);
        if(!player)return;
        if(this.players.includes(player))return;
        if(this.status !== 'IDLE')return;

        let existingInvite = this.pendingInvites.find(invite => invite.sub === sub && invite.expires > Date.now());
        if (existingInvite) {
            return;
        }

        this.pendingInvites.push({
            sub,
            expires: Date.now() + (10 * 60 * 1000)
        })

        if (this.pendingInvites.length > 10) {
            this.pendingInvites.shift();
        }

        player.sendMessage({
            meta: {
                type: 'inviteIncoming'
            },
            lobbyId: this.id,
            lobbyLeaderSub: this.players[this.leaderIndex].sub
        })

        this.broadcast({
            meta: {
                type: 'inviteSentNotification'
            },
            inviteeSub: player.sub
        });
        
        console.log('here')
    }

    acceptInvite(player){
        let existingInvite = this.pendingInvites.find(invite => invite.sub === player.sub && invite.expires > Date.now());
        if (!existingInvite) {
            return;
        } 

        let joinSuccess = this.playerAdd(player);
        if(!joinSuccess){
            player.sendMessage({
                meta: {
                    type: 'inviteAcceptFailed'
                }
            })
        }
    }

    chat(player, message){
        message = xss(message)
        this.broadcast({
            meta: {
                type: 'chat'
            },
            authorSub: player.sub,
            message: message
        })
    }
}

class Player {
    static players = {}

    static register(sub, connection){
        let existingPlayer = this.players[sub];
        if(existingPlayer){
            if(existingPlayer.connections.length >= 5){
                connection.close();
                return;
            };

            existingPlayer.addConnection(connection)

            return;
        }

        let player = new Player(sub, connection);
        player.addConnection(connection)
    }

    constructor(sub){
        Player.players[sub] = this;

        this.connections = [];
        this.lobby = new Lobby(this);
        this.sub = sub;
        this.messageQueue = [];
        this.messageRunning = false;

        // todo: elo retrieval
    }

    sendMessage(json){
        this.connections.forEach(connection => {
            if (connection.readyState === connection.OPEN) {
                connection.send(JSON.stringify(json));
            } else {
                this.removeConnection(connection)
            }
        });
    }

    async handleMessage(event) {
        let data;
        try {
            data = JSON.parse(event.toString());
        } catch (err) {
            console.error('Failed to parse message:', err);
            return;
        }

        this.messageQueue.push(data);
        if (!this.messageRunning) this.messageDrain();
    }

    async messageDrain() {
        this.messageRunning = true;
        while (this.messageQueue.length > 0) {
            const data = this.messageQueue.shift();
            try {
                console.log('message received:', data);
                
                if(data.action === 'queueStart'){
                    if(!this.lobby.isLeader(this))return;
                    this.lobby.queueStart();

                } else if(data.action === 'queueStop'){
                    if(!this.lobby.isLeader(this))return;
                    this.lobby.queueStop()

                } else if(data.action === 'leave'){
                    if(this.lobby.isLeader(this) && this.lobby.players.length == 1)return;
                    this.lobby.playerRemove(this);

                } else if(data.action === 'kick'){
                    if(!this.lobby.isLeader(this))return;

                    let playerSub = data.playerSub;
                    if(!playerSub)return;
                    
                    let player = Player.players[playerSub];
                    if(!player)return;

                    if(player.lobby.id = this.lobby.id)return;

                    this.lobby.playerRemove(player)
                    this.lobby.broadcast({
                        meta: {
                            'type': 'playerLeft'
                        },
                        reason: 'KICKED',
                        sub: player.sub
                    })

                } else if(data.action === 'inviteSend'){
                    let playerSub = data.playerSub;
                    if(!playerSub)return;
                    // todo: add a friend check
                    this.lobby.sendInvite(playerSub)

                } else if(data.action == 'inviteAccept'){
                    let lobbyId = data.lobbyId;
                    if(!lobbyId)return;

                    let lobby = Lobby.lobbies[lobbyId];
                    if(!lobby)return;

                    lobby.acceptInvite(this)

                } else if(data.action === 'promote'){
                    if(!this.lobby.isLeader(this))return;
                } else if(data.action === 'acceptMatch'){

                } else if(data.action === 'banMap'){
                    
                } else if(data.action === 'chat'){
                    let message = data.message;
                    if(typeof message !== 'string' || message.length <= 0 || message.length > 150)return;
                    this.lobby.chat(this, message)
                }
            } catch (err) {
                console.error('Error handling message:', err);
            }
        }
        this.messageRunning = false;
    }

    addConnection(connection){
        this.connections.push(connection)
        connection.on('message', event => {
            this.handleMessage(event)
        })

        connection.on('close', ()=>{
            console.log('connection closed')
            this.removeConnection(connection)
        })

        connection.send(JSON.stringify({
            action: 'confirmRegistered'
        }))
    }

    removeConnection(connection){
        let index = this.connections.indexOf(connection);
        console.log('conn index: ', index)
        if(index === undefined)return;

        this.connections.splice(index, 1)
        if(connection.readyState === connection.OPEN){
            connection.close()
        }

        if(this.connections.length == 0){
            this.lobby.playerRemove(this);
            this.lobby.broadcast({
                meta: {
                    type: 'playerLeft'
                },
                reason: 'LOST_CONNECTION',
                sub: this.sub
            })
            delete Player.players[this.sub];
            this.lobby = null;
            this.connections = null;
            this.sub = null;
        }
    }
}

wss.on('connection', (socket) => {
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

                    let registrationData = (typeof key == 'object' && key.secret == process.env.WS_ENCRYPT_KEY) ? key : JSON.parse(decrypt(key, process.env.WS_ENCRYPT_KEY));

                    if(
                        Date.now() - registrationData.time > (60 * 1000) && process.env.MODE != 'DEV' ||
                        !registrationData.sub
                    ){
                        socket.close();
                        return;
                    }

                    socket.removeAllListeners()
                    Player.register(registrationData.sub, socket)
                }
            }
        } catch (e){
            console.log(e)
            console.log('^^^ SOCKET ERROR ^^^')
            socket.close()
        }
    })
})

module.exports = { Lobby, Player }