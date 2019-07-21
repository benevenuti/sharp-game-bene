function Controller(Model, View) {
    this.Model = new Model;
    this.View = new View(this);

    // inicializa o Controller
    this.init();
}

Controller.prototype.init = function init(){
    console.log('inicializou o controller');

    // eventos do model
    $.subscribe('Model.userConnectedEvent.Ctrl', this.socketUserConnected.bind(this));
    $.subscribe('Model.updateMyDataEvent.Ctrl', this.updateMyData.bind(this));
    $.subscribe('Model.updateUserListEvent.Ctrl', this.updateUserList.bind(this));
    $.subscribe('Model.gameFailedEvent.Ctrl', this.gameFailed.bind(this));
    $.subscribe('Model.gameStartedEvent.Ctrl', this.gameStarted.bind(this));
    $.subscribe('Model.playEvent.Ctrl', this.play.bind(this));
    $.subscribe('Model.youWinEvent.Ctrl', this.youWin.bind(this));
    $.subscribe('Model.youLoseEvent.Ctrl', this.youLose.bind(this));
    $.subscribe('Model.gameTideEvent.Ctrl', this.gameTide.bind(this));


    // eventos da view
    $.subscribe('View.updateUsernameSubmitEvent.Ctrl', this.updateUsername.bind(this));
    $.subscribe('View.selectOponentEvent.Ctrl', this.selectOponent.bind(this));
    $.subscribe('View.userPlayedEvent.Ctrl', this.userPlayed.bind(this));

}

Controller.prototype.socketUserConnected = function(e, socket){
    console.log('Model conectou');
}

Controller.prototype.updateMyData = function(e, myData){
    console.log('Controller.updateMyData');
    console.log(myData);

    this.View.updateMyData(myData);
}

Controller.prototype.updateUserList = function(e, users){
    console.log('Controller.updateUserList');
    console.log(users);
    
    this.View.renderUserList(users, this.Model.getMyData());
}

Controller.prototype.updateUsername = function(e, newName){
    console.log('Controller.updateUsername');
    this.Model.updateUsername(newName);
}

Controller.prototype.selectOponent = function(e, oponent){
    console.log('Controller.selectOponent');
    this.Model.startNewGame(oponent);
}

Controller.prototype.gameFailed = function(e, oponent){
    console.log('Controller.gameFailed');
    this.View.gameFailed(oponent);
};

Controller.prototype.gameStarted = function(e, gameData){
    console.log('Controller.gameStarted');
    this.View.startGame(gameData);
}

Controller.prototype.play = function(e, obj){

    console.log('Controller.play');
    
    if(obj != null) {
        // adiversario jogou na celula cel
        this.View.oponentPlayed(obj);
    }

    if(obj == null || obj.gameResult == 'proximo') {
        this.View.enablePlay();
    }

};

Controller.prototype.userPlayed = function(e, cel){
    console.log('Controller.userPlayed');
    this.Model.userPlayed(cel);
};

Controller.prototype.youWin = function(e){
    console.log('Controller.youWin');
    this.View.gameFinished('win');
};

Controller.prototype.youLose = function(e){
    console.log('Controller.youLose');
    this.View.gameFinished('lose');
};

Controller.prototype.gameTide = function(e){
    console.log('Controller.gameTide');
    this.View.gameFinished('tide');
};