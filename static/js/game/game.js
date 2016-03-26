define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    var stage = new Facade(document.querySelector('canvas')),
        game = new Plastick(stage);

    game.TARGET_TPS = 60;

    game.setDebug(true);

    stage.resizeForHDPI();

    return game;

});
