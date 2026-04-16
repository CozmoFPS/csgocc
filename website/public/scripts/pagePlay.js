let htmlPlay = document.getElementById('play')
let htmlPlaySubtext = document.getElementById('playSubtext')

let lobbyState = {};

async function renderLobby(newLobbyState){
    if(newLobbyState.status !== lobbyState.status){
        if(newLobbyState.status === 'NO_LOGIN'){
            htmlPlaySubtext.innerHTML = 'Sign in with Steam to queue'
        }
    }

    lobbyState = newLobbyState
}

if(!userid){
    renderLobby({
        status: "NO_LOGIN"
    })
}
