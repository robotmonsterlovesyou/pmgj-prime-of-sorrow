define(function (require) {

    var game = require('./game/game'),
        intro = require('./game/intro'),
        level = require('./game/level')('../../data/level1.json');

    game.context.webkitImageSmoothingEnabled = false;

    // game.start(intro);
    game.start(level);

});
