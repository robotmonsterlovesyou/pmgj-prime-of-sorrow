define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    require('facadejs-Box2D-plugin');

    var game = require('./game');

    var state = new Plastick.State('level');

    var controller = require('../utils/controller')(state);

    var camera = require('../utils/camera');

    var generateEntityFromObject = require('../utils/box2d').generateEntityFromObject;

    var world = new Facade.Entity().Box2D('createWorld', { canvas: game.canvas, gravity: [ 0, 20 ] });

    var entities = {
        platforms: []
    };

    state.init(function () {

        fetch('../../data/level1.json').then(function (response) {
            return response.json();
        }).then(function (data) {

            Object.keys(data).forEach(function (type) {

                var items = data[type];

                if (items.length) {

                    entities[type] = items.map(function (item) {

                        return generateEntityFromObject(item, world);

                    });

                }

            });

        });

    });

    state.update(function () {



    });

    state.draw(function () {

        game.facade.clear();

        game.facade.addToStage([
            entities.platforms
        ]);

        world.Box2D('drawDebug');

    });

    return state;

});
