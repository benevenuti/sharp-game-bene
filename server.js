let express = require('express')
let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)
let port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000
let uniqid = require('uniqid')
let _ = require('lodash')
let cors = require('cors')

let usuarios = []
let jogos = []

let win = [
    [1,2,4],
    [1,8,64],
    [1,16,256],
    [2,16,128],
    [4,32,256],
    [4,16,64],
    [8,16,32],
    [64,128,256]
]

app.use(express.static('public'))
app.use(cors())

http.listen(port, () => {
    console.info(`Server rodando na porta ${port}`)
})

io.on('connection', socket => {

    userConnected(socket)

    socket.on('editName', newName => {
        updateName(newName, socket)
    })

    socket.on('startNewGame', oponent => {
        startNewGame(oponent, socket)
    })

    socket.on('userPlayed', cel => {
        socketPlayed(cel, socket)
    })

    socket.on('disconnect', () => {
        console.info('usuário desconectado')

        let oponentId = null

        for(let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].tictac.id == socket.tictac.id) {

                if(socket.tictac.status != 'disponivel'){

                    for(let j = 0; j < jogos.length; j++){
                        p1Id = jogos[j].player1.id
                        p2Id = jogos[j].player2.id

                        if (p1Id == socket.tictac.id || p2Id == socket.tictac.id) {
                            if (p1Id == socket.tictac.id) {
                                findSocketByUserId(p2Id).emit('gameFailed', socket.tictac)
                                oponentId = p2Id
                            } else {
                                findSocketByUserId(p1Id).emit('gameFailed', socket.tictac)
                                oponentId = p1Id
                            }

                            jogos.splice(j, 1)
                        }
                    }
                }
                
                for (let j = 0; j < usuarios.length; j++) {
                    if (usuarios[j].tictac.id == oponentId) {
                        usuarios[j].tictac.status = 'disponivel'
                        usuarios[j].tictac.oponent = null
                        usuarios[j].tictac.symbol = null
                    }
                }

                usuarios.splice(i, 1)
                updateUserList(socket)
                break
            }
        }

        updateUserList(socket)

    })

    function userConnected(socket) {
        console.info('Novo usuário conectado')

        let id = uniqid()

        socket.tictac = {
            id,
            name : `visitante - ${id}`,
            status : "disponivel",
            oponent : null,
            symbol : null 
        }

        usuarios.push(socket)
        updateMyData(socket)
        updateUserList(socket)
    }

    function updateMyData(socket) {
        socket.emit('updateMyData', socket.tictac)
    }

    function updateUserList(socket) {
        let listaUsuarios = usuarios
            .map( usuario  => {
                return usuario.tictac
            })
            .filter( usuario => {
                return usuario.status == "disponivel"
            })
        io.emit('updateUserList', listaUsuarios)
    }

    function updateName(newName, socket) {
        console.info('Editou o nome')

        socket.tictac.name = newName
        updateMyData(socket)
        updateUserList(socket)
    }

    function startNewGame(oponent, socket) {
        if (oponent.status != "disponivel") {
            socket.emit("gameFailed", oponent)
        } else {
            let socketOponent = findSocketByUserId(oponent.id)

            if (!socketOponent) return false

            socket.tictac.oponent = oponent.id
            socketOponent.tictac.oponent = socket.tictac.id

            socket.tictac.status = 'game'
            socketOponent.tictac.status = 'game'

            socket.tictac.symbol = 'O'
            socketOponent.tictac.symbol = 'X'

            updateUserList(socket)

            let thisGame = {
                player1 : {
                    id : socket.tictac.id,
                    selectedCel : []
                },
                player2 : {
                    id : socketOponent.tictac.id,
                    selectedCel : []
                },
                key : `${socket.tictac.id}-${socketOponent.id}`,
                play : ((Math.random() * (1-0) + 0) == 0 ) ? socketOponent : socket
            }

            jogos.push(thisGame)

            socket.emit('gameStarted', { oponent, symbol : socket.tictac.symbol})
            socketOponent.emit('gameStarted', { oponent : socket.tictac, symbol : socketOponent.tictac.symbol})

            setTimeout( thisGame => {
                thisGame.play.emit('play', null)                
            }, 200, thisGame)

        }
    }

    function findSocketByUserId(id) {
        for (let i = 0; i < usuarios.length; i++) {
            if(usuarios[i].tictac.id == id) return usuarios[i]
        }

        return false
    }

    function socketPlayed(cel, socket) {
        let gameData = null
        let oponent = null
        let socketOponent = null

        let games = null
        let gameResult = null
        let gameKey = null

        for (let i = 0; i < jogos.length; i++) {
            let p1Id = jogos[i].player1.id
            let p2Id = jogos[i].player2.id
            if (p1Id == socket.tictac.id || p2Id == socket.tictac.id) {
                gameKey = i
                gameData = jogos[i]
            }
        }

        oponent = (gameData.player1.id == socket.tictac.id ? {id : gameData.player2.id, player : "2"} : {id : gameData.player1.id, player : "1"} )
        socketOponent = findSocketByUserId(oponent.id)

        if ( oponent.player == "1") {
            gameData.player1.selectedCel.push(cel)
            games = gameData.player1.selectedCel
        } else {
            gameData.player2.selectedCel.push(cel)
            games = gameData.player2.selectedCel
        }

        status = false

        if (games.length >= 3) {
            for (let i = 0; i < win.length; i++) {
                if (_.difference(win[i], games.sort()).length === 0) {
                    status = true
                    break
                }
            }
        }

        if (status == true) {
            console.info('ganhou')
            gameResult = 'ganhou'

            socket.emit('youWin')
            socketOponent.emit('youLose')
        } else if (gameData.player1.selectedCel.length + gameData.player2.selectedCel.length >= 9) {
            console.log('empatou')
            gameResult ='empatou'

            socket.emit('gameTide')
            socketOponent.emit('gameTide')
        } else {
            console.info('proxima jogada')
            gameResult = 'proximo'
        }

        if (gameResult == 'empatou' || gameResult == 'ganhou') {
            jogos.slice(gameKey, 1)

            socket.tictac.status = 'disponivel'
            socket.tictac.oponent = null
            socket.tictac.symbol = null    

            socketOponent.tictac.status = 'disponivel'
            socketOponent.tictac.oponent = null
            socketOponent.tictac.symbol = null

            updateUserList(socket)
        }

        socketOponent.emit('play', {cel, gameResult, symbol : socket.tictac.symbol})

    }

})
