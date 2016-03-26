define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    var game = require('./game');
    var level = require('./level');

    var state = new Plastick.State('intro');

    var controller = require('./controller')(state);

    var title = new Facade.Text('Prime of Sorrow', {
        y: (game.facade.height() / 2) - 40,
        width: game.facade.width(),
        fontSize: 40,
        fontStyle: 'bold',
        textAlignment: 'center'
    });

    var isntructions = new Facade.Text('Press any key to continue.', {
        y: (game.facade.height() / 2) + 20,
        width: game.facade.width(),
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

        game.facade.clear();

        game.facade.addToStage(title);
        game.facade.addToStage(isntructions);

    });

    return state;

});
