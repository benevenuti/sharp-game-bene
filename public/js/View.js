function View() {
    console.log('View - WhatsClone');

    // variaveis
    this.symbol = null;

    // objetos de interacao
    this.header = null;
    this.userListContainer = null;
    this.gameContainer = null;
    this.changeNameButton = null;
    this.containerShowUsername = null;
    this.showUsername = null;
    this.containerFormUpdateUsername = null;
    this.inputUpdateUsername = null;
    this.formUpdateName = null;
    this.btnCancelUsernameUpdate = null;
    this.footer = null;

    // templates
    this.templates = {
        btnStartGame: null,
        newGame: null
    }

    this.init();
}

View.prototype.init = function init() {

    // seletores
    this.header = $('.js-header');
    this.userListContainer = $('.js-userlist-container');
    this.gameContainer = $('.js-game-container');
    this.changeNameButton = $('.js-btn-changename');
    this.containerShowUsername = $('.js-container-link-username');
    this.showUsername = $('.js-show-username');
    this.containerFormUpdateUsername = $('.js-form-update-name');
    this.inputUpdateUsername = $('.js-input-update-username');
    this.formUpdateName = $('.js-form-change-name');
    this.btnCancelUsernameUpdate = $('.js-btn-cancel');
    this.footer = $('.js-footer');

    // templates
    this.templates.btnStartGame = $('#template-btn-start-game');
    this.templates.newGame = $('#template-new-game');

    // eventos DOM
    this.showUsername.on('click', $.proxy(function (e) {
        e.preventDefault();
        this.containerShowUsername.toggleClass('hidden');
        this.containerFormUpdateUsername.toggleClass('hidden');
    }, this));

    // submit do formulario de alterar nome
    this.formUpdateName.on('submit', $.proxy(function (e) {
        e.preventDefault();

        var newName = this.inputUpdateUsername.val().trim();

        if (newName != "") {

            $.publish('View.updateUsernameSubmitEvent', newName); // dispara o evento que sera capturado pelo controller

            this.containerShowUsername.toggleClass('hidden');
            this.containerFormUpdateUsername.toggleClass('hidden');
        }
    }, this));

    // button de cancelar
    this.btnCancelUsernameUpdate.on('click', $.proxy(function (e) {
        e.preventDefault();

        this.containerShowUsername.toggleClass('hidden');
        this.containerFormUpdateUsername.toggleClass('hidden');
    }, this));
}

View.prototype.updateMyData = function (myData) {
    console.log('View.updateMyData');
    console.log(myData);

    this.showUsername.text(myData.name);
    this.inputUpdateUsername.val(myData.name);
};

View.prototype.renderUserList = function (userList, myData) {
    console.log('View.renderUserList');

    this.userListContainer.empty();

    for (i = 0; i < userList.length; i++) {
        if (userList[i].id != myData.id) {
            var $userBtn = $(this.templates.btnStartGame.html().replace(/{{userName}}/g, userList[i].name));

            $userBtn
                .find('.js-btn-startgame')
                .on('click.addclass', { self: this }, function (e) {
                    e.data.self.userListContainer.addClass('wait'); // desabilita o click
                })
                .on('click.callevent', { oponent: userList[i] }, $.proxy(function (e) {

                    $.publish('View.selectOponentEvent', e.data.oponent);

                }, this));

            this.userListContainer.append($userBtn);
        }
    }
}

View.prototype.gameFailed = function (oponent) {
    console.log('View.gameFailed');
    this.userListContainer.fadeIn('fast').removeClass('wait');
    this.gameContainer.fadeOut('fast').empty();
    alert('Jogo encerrado ou falhou, tente outro oponente.');
}

View.prototype.startGame = function (gameData) {
    console.log('View.startGame');

    this.symbol = gameData.symbol;
    this.userListContainer.hide('fast');

    var newGame = $(this.templates.newGame.html());

    this.gameContainer.append(newGame);

    this.gameContainer.find('.js-btn-game')
        .on('click', { self: this }, function (e) {

            var btn = $(this);
            var viewObj = e.data.self;

            btn.text(viewObj.symbol).addClass('wait');
            viewObj.gameContainer.addClass('wait');
            $.publish('View.userPlayedEvent', parseInt(btn.attr('data-value')));

        });

    this.gameContainer.addClass('wait').removeClass('hidden').show('fast');
}

View.prototype.enablePlay = function () {
    console.log('View.enablePlay');

    this.gameContainer.removeClass('wait');
}

View.prototype.oponentPlayed = function (obj) {
    console.log('View.oponentPlayed');

    var pressedBtn = this.gameContainer.find('[data-value="' + obj.cel + '"]');
    pressedBtn.text(obj.symbol).addClass('wait');
}

View.prototype.gameFinished = function (status) {
    this.gameContainer.hide('fast').addClass('wait').empty();
    this.userListContainer.show('fast').removeClass('wait');

    setTimeout(function (status) {
        if (status == 'win') {
            alert('Você ganhou!');
        } else if (status == 'lose') {
            alert('Você perdeu!');
        } else {
            alert('Jogo empatado!');
        }
    }, 1000, status);

}

/*
    Se quisesse pegar eventos do model dentro da view
    Mas este é um anti-pattern

    Passar o controller por parametro no construtor e armazenar em this.App
    this.App = app; // permite acessar model, não que isso seja bom
    this.App.Model.meuEvento.attach(this.meuEvento); // escuta um evento no model

    View.prototype.meuEvento = function(){
        console.log('Estou na view mas ocorreu um evento la no Model');
    }
*/