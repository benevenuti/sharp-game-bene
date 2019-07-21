function Model() {
    console.log('Model Started');

    // variaveis
    this.socket = null;
    this.myData = null;
    this.userList = [];
    this.gameData = null;

    // inicializa o model
    this.init();
};

Model.prototype.init = function () {
    // instancia o socket
    this.socket = io('https://sharp-game-bene.herokuapp.com/');

    // evento de conexao
    this.socket.on('connection', this.userConnected.bind(this));
    this.socket.on('updateMyData', this.updateMyData.bind(this));
    this.socket.on('updateUserList', this.updateUserList.bind(this));
    this.socket.on('gameFailed', this.gameFailed.bind(this));
    this.socket.on('gameStarted', this.gameStarted.bind(this));
    this.socket.on('play', this.play.bind(this));
    this.socket.on('youWin', this.youWin.bind(this));
    this.socket.on('youLose', this.youLose.bind(this));
    this.socket.on('gameTide', this.gameTide.bind(this));
};

Model.prototype.userConnected = function () {
    console.log('Usuario conectado');
    console.log(this)
    // dispara o evento de usuario conectado
    $.publish('Model.userConnectedEvent');
};

Model.prototype.updateMyData = function (data) { // os dados do usuario foram atualizados
    console.log('updateMyData');

    this.myData = data;
    $.publish('Model.updateMyDataEvent', this.myData);
};

Model.prototype.getMyData = function () { // retorna os dados do usuario armazenados em this.myData
    return this.myData;
};

Model.prototype.updateUsername = function (newName) { // recebe um novo nome e atualiza o mesmo no server
    console.log('Model.updateUsername - nome atualizado');
    this.socket.emit('editName', newName);
}

Model.prototype.updateUserList = function (users) { // recebe uma lista atualizada de usuarios 
    console.log('Model.updateUserListEvent');
    console.log(users);

    this.userList = users;
    $.publish('Model.updateUserListEvent', [users]);
};

Model.prototype.getUserList = function () { // retorna a lista de usuarios presente em this.userList
    return this.userList;
};

Model.prototype.startNewGame = function (oponentId) { // envia o aviso para criar um novo jogo
    this.socket.emit('startNewGame', oponentId);
};

Model.prototype.gameFailed = function (oponent) { // jogo falhou, usado para desconexao e requisicao com falha
    console.log('Model.gameFailed');
    $.publish('Model.gameFailedEvent', oponent);
}

Model.prototype.gameStarted = function (gameData) { // recebe o aviso do servidor que iniciou um novo jogo
    console.log('Model.gameStarted');
    console.log(gameData);
    $.publish('Model.gameStartedEvent', gameData);
}

Model.prototype.getGameData = function () {
    return this.gameData;
}

Model.prototype.play = function (obj) { // habilita minha vez de jogar
    console.log('Model.play');
    console.log(obj)
    $.publish('Model.playEvent', obj);
}

Model.prototype.userPlayed = function (cel) { // meu oponente jogou
    console.log('Model.userPlayed');
    this.socket.emit('userPlayed', cel);
}

Model.prototype.youWin = function () { // avisa que eu venci
    console.log('Model.youWin');
    $.publish('Model.youWinEvent');
}

Model.prototype.youLose = function () { // avisa que eu perdi
    console.log('Model.youLose');
    $.publish('Model.youLoseEvent');
}

Model.prototype.gameTide = function () { // avisa que o jogo empatou
    console.log('Model.gameTide');
    $.publish('Model.gameTideEvent');
}