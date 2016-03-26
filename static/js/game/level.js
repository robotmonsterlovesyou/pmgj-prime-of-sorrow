define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    var game = require('./game');

    var state = new Plastick.State('level');

    var controller = require('./controller')(state);

    var box = new Facade.Rect({
        x: game.stage.width() / 2,
        y: game.stage.height() / 2,
        width: 25,
        height: 25,
        anchor: 'center'
    });

    var speed = 5;

    state.update(function () {

        var e;

        if (controller.queue.length) {

            while (controller.queue.length) {

                e = controller.queue.shift();

                if (e.type === 'hold' && e.button === 'd_pad_left') {

                    box.setOptions({ x: '-=' + speed });

                } else if (e.type === 'hold' && e.button === 'd_pad_right') {

                    box.setOptions({ x: '+=' + speed });

                } else if (e.type === 'hold' && e.button === 'd_pad_up') {

                    box.setOptions({ y: '-=' + speed });

                } else if (e.type === 'hold' && e.button === 'd_pad_down') {

                    box.setOptions({ y: '+=' + speed });

                } else if (e.type === 'hold' && e.button === 'stick_axis_left') {

                    if (e.value[0] < -0.1) {

                        box.setOptions({ x: '-=' + speed });

                    } else if (e.value[0] > 0.1) {

                        box.setOptions({ x: '+=' + speed });

                    }

                    if (e.value[1] < -0.1) {

                        box.setOptions({ y: '-=' + speed });

                    } else if (e.value[1] > 0.1) {

                        box.setOptions({ y: '+=' + speed });

                    }

                }

            }

        }

    });

    state.draw(function () {

        game.stage.clear();

        game.stage.addToStage(box);

    });

    return state;

});
