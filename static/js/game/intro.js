define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    var game = require('./game');
    var level = require('./level');

    var state = new Plastick.State('intro');

    var controller = require('./controller')(state);

    var title = new Facade.Text('Hello World!', {
        y: (game.stage.height() / 2) - 20,
        width: game.stage.width(),
        fontSize: 20,
        textAlignment: 'center'
    });

    state.update(function () {

        var e;

        if (controller.queue.length) {

            while (controller.queue.length) {

                e = controller.queue.shift();

                if (e.type === 'press' && e.button === 'button_1') {

                    game.changeState(level);

                }

            }

        }

    });

    state.draw(function () {

        game.stage.clear();

        game.stage.addToStage(title);

    });

    return state;

});
