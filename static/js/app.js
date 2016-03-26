define(function (require) {

    var game = require('./game/game'),
        intro = require('./game/intro');

    game.start(intro);

});
