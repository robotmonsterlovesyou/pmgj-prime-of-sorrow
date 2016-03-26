define(function (require) {

    var game = require('./game/game'),
        intro = require('./game/intro'),
        level = require('./game/level');

    // game.start(intro);
    game.start(level);

});
